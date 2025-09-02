import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid listing ID' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if listing exists and belongs to the user
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.userId !== user.id) {
      return res.status(403).json({ error: 'You can only view contacts for your own listings' });
    }

    // Get contact events for this listing
    const contactEvents = await prisma.contactEvent.findMany({
      where: { listingId: id },
      include: {
        contacter: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by contacter to show unique contacts
    const contactsMap = new Map();
    
    contactEvents.forEach(event => {
      const contacterId = event.contacter.id;
      if (!contactsMap.has(contacterId)) {
        contactsMap.set(contacterId, {
          user: event.contacter,
          firstContact: event.createdAt,
          lastContact: event.createdAt,
          contactCount: 0,
          contactTypes: new Set(),
          events: []
        });
      }
      
      const contact = contactsMap.get(contacterId);
      contact.contactCount++;
      contact.contactTypes.add(event.contactType);
      contact.lastContact = event.createdAt;
      contact.events.push({
        type: event.contactType,
        message: event.message,
        createdAt: event.createdAt
      });
    });

    const contacts = Array.from(contactsMap.values()).map(contact => ({
      ...contact,
      contactTypes: Array.from(contact.contactTypes)
    }));

    return res.status(200).json({ 
      contacts,
      totalContacts: contacts.length,
      totalEvents: contactEvents.length
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
}