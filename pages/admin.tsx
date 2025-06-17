import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stories, setStories] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || user.email !== 'meemejkariithi@gmail.com') {
        router.push('/login');
        return;
      }

      setUser(user);

      const [storyData, referralData, subscriptionData, promoData] = await Promise.all([
        supabase.from('stories').select('*'),
        supabase.from('referrals').select('*'),
        supabase.from('subscriptions').select('*'),
        supabase.from('promotions').select('*'),
      ]);

      setStories(storyData.data || []);
      setReferrals(referralData.data || []);
      setSubscriptions(subscriptionData.data || []);
      setPromotions(promoData.data || []);
      setLoading(false);
    };

    fetchAdminData();
  }, []);

  const handleStoryAction = async (id: string, action: 'approve' | 'reject') => {
    await supabase
      .from('stories')
      .update({ status: action === 'approve' ? 'approved' : 'rejected' })
      .eq('id', id);
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: action === 'approve' ? 'approved' : 'rejected' } : s))
    );
  };

  if (loading) return <div className="p-4 text-center">Loading admin panel...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Stories */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold">All Stories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {stories.map((story) => (
            <div key={story.id} className="border p-3 rounded shadow-sm bg-white">
              <h3 className="font-bold">{story.title}</h3>
              <p className="text-sm text-gray-600">Grade: {story.grade} | {story.language}</p>
              <p>Status: <strong>{story.status}</strong></p>
              {story.status === 'pending' && (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleStoryAction(story.id, 'approve')}
                    className="px-3 py-1 bg-green-500 text-white rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStoryAction(story.id, 'reject')}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Referrals */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold">Referrals</h2>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Referrer</th>
              <th>Email</th>
              <th>Status</th>
              <th>Commission</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((ref) => (
              <tr key={ref.id} className="border-t">
                <td className="p-2">{ref.referrer_id}</td>
                <td>{ref.referred_email}</td>
                <td>{ref.status}</td>
                <td>KES {ref.earnings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Subscriptions */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold">Subscriptions</h2>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th>User</th>
              <th>Type</th>
              <th>Grade</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-t">
                <td className="p-2">{sub.user_id}</td>
                <td>{sub.type}</td>
                <td>{sub.grade}</td>
                <td>{sub.expiry_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Promotions */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold">Promotions</h2>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th>User</th>
              <th>Content</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promo) => (
              <tr key={promo.id} className="border-t">
                <td className="p-2">{promo.user_id}</td>
                <td>{promo.content}</td>
                <td>{promo.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
} 
