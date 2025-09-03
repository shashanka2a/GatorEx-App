import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { supabase } from '../../../src/lib/supabase';
import { REWARD_STATUS } from '../../../src/lib/referrals/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { rewardId } = req.body;
    const idempotencyKey = req.headers['idempotency-key'] as string;

    if (!rewardId) {
      return res.status(400).json({ error: 'Reward ID required' });
    }

    if (!idempotencyKey) {
      return res.status(400).json({ error: 'Idempotency-Key header required' });
    }

    const userId = session.user.id;

    // Check if reward exists and belongs to user
    const { data: reward, error: fetchError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    if (reward.status !== REWARD_STATUS.approved) {
      return res.status(400).json({ error: 'Reward not approved for claiming' });
    }

    // Check for existing claim with same idempotency key
    const { data: existingClaim } = await supabase
      .from('reward_claims')
      .select('*')
      .eq('reward_id', rewardId)
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existingClaim) {
      return res.status(200).json({ 
        success: true, 
        message: 'Reward already claimed',
        claimId: existingClaim.id 
      });
    }

    // Create claim record
    const { data: claim, error: claimError } = await supabase
      .from('reward_claims')
      .insert({
        reward_id: rewardId,
        user_id: userId,
        idempotency_key: idempotencyKey,
        status: 'pending',
        claimed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (claimError) {
      throw claimError;
    }

    // Update reward status to paid
    const { error: updateError } = await supabase
      .from('rewards')
      .update({ status: REWARD_STATUS.paid })
      .eq('id', rewardId);

    if (updateError) {
      throw updateError;
    }

    res.status(200).json({ 
      success: true, 
      message: 'Reward claimed successfully',
      claimId: claim.id,
      reward: {
        type: reward.type,
        amount_cents: reward.amount_cents,
        tier: reward.tier
      }
    });

  } catch (error) {
    console.error('Reward claim error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}