import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Users, Mail, Phone, MessageSquare, Eye, Clock, User } from 'lucide-react';
import { Button } from '../../../src/components/ui/button';
import { Badge } from '../../../src/components/ui/badge';

interface ContactEvent {
  type: string;
  message: string | null;
  createdAt: string;
}

interface Contact {
  user: {
    id: string;
    name: string | null;
    email: string;
    phoneNumber: string | null;
  };
  firstContact: string;
  lastContact: string;
  contactCount: number;
  contactTypes: string[];
  events: ContactEvent[];
}

interface ContactsData {
  contacts: Contact[];
  totalContacts: number;
  totalEvents: number;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
}

export default function ListingContactsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [contactsData, setContactsData] = useState<ContactsData | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListing = useCallback(async () => {
    if (!id || typeof id !== 'string') return;
    
    try {
      const response = await fetch(`/api/listings/${id}`);
      if (response.ok) {
        const data = await response.json();
        setListing(data);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
    }
  }, [id]);

  const fetchContacts = useCallback(async () => {
    if (!id || typeof id !== 'string') return;
    
    try {
      const response = await fetch(`/api/listings/${id}/contacts`);
      if (response.ok) {
        const data = await response.json();
        setContactsData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (id && typeof id === 'string') {
      fetchContacts();
      fetchListing();
    }
  }, [session, status, router, id, fetchContacts, fetchListing]);



  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return <Mail size={14} className="text-blue-500" />;
      case 'SMS':
        return <MessageSquare size={14} className="text-green-500" />;
      case 'PHONE':
        return <Phone size={14} className="text-purple-500" />;
      case 'VIEW_CONTACT':
        return <Eye size={14} className="text-gray-500" />;
      default:
        return <User size={14} className="text-gray-500" />;
    }
  };

  const getContactTypeLabel = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return 'Email';
      case 'SMS':
        return 'Text';
      case 'PHONE':
        return 'Phone';
      case 'VIEW_CONTACT':
        return 'Viewed Contact';
      default:
        return type;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-8 shadow-sm max-w-md">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Contacts</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Listing Contacts - {listing?.title || 'GatorEx'}</title>
        <meta name="description" content="View contacts for your listing" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="p-2"
                >
                  <ArrowLeft size={20} />
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Listing Contacts</h1>
                  {listing && (
                    <p className="text-sm text-gray-600 truncate max-w-md">
                      {listing.title} - ${listing.price}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={listing?.status === 'SOLD' ? 'default' : 'secondary'}>
                  {listing?.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{contactsData?.totalContacts || 0}</p>
                  <p className="text-sm text-gray-600">Unique Contacts</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{contactsData?.totalEvents || 0}</p>
                  <p className="text-sm text-gray-600">Total Interactions</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {contactsData?.contacts.filter(c => c.contactTypes.includes('VIEW_CONTACT')).length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Viewed Contact Info</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contacts List */}
          {contactsData?.contacts && contactsData.contacts.length > 0 ? (
            <div className="space-y-6">
              {contactsData.contacts.map((contact, index) => (
                <div key={contact.user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {contact.user.name || 'UF Student'}
                          </h3>
                          <p className="text-sm text-gray-600">{contact.user.email}</p>
                          {contact.user.phoneNumber && (
                            <p className="text-sm text-gray-600">{contact.user.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {contact.contactCount} interaction{contact.contactCount !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last: {new Date(contact.lastContact).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Contact Types */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {contact.contactTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          <span className="mr-1">{getContactTypeIcon(type)}</span>
                          {getContactTypeLabel(type)}
                        </Badge>
                      ))}
                    </div>

                    {/* Recent Events */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
                      <div className="space-y-2">
                        {contact.events.slice(0, 3).map((event, eventIndex) => (
                          <div key={eventIndex} className="flex items-center space-x-3 text-sm">
                            {getContactTypeIcon(event.type)}
                            <span className="text-gray-600">
                              {getContactTypeLabel(event.type)}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">
                              {new Date(event.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                        {contact.events.length > 3 && (
                          <p className="text-xs text-gray-500 mt-2">
                            +{contact.events.length - 3} more interactions
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
              <p className="text-gray-600 mb-6">
                When people contact you about this listing, they'll appear here.
              </p>
              <Link
                href="/me"
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}