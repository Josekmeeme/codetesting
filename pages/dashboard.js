// pages/dashboard.js

import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';
import AudioPlayer from '../components/AudioPlayer';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stories, setStories] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUser(user);

      const { data: storiesData } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id);

      const { data: refData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);

      const { data: promoData } = await supabase
        .from('promotions')
        .select('*')
        .eq('user_id', user.id);

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setStories(storiesData || []);
      setReferrals(refData || []);
      setPromotions(promoData || []);
      setSubscription(subData || null);
      setLoading(false);
    };

    fetchDashboard();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.email}</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Your Subscriptions</h2>
        {subscription ? (
          <div className="p-3 border rounded bg-green-50 mt-2">
            <p>Grade: {subscription.grade}</p>
            <p>Type: {subscription.type}</p>
            <p>Expires: {subscription.expiry_date}</p>
          </div>
        ) : (
          <p className="text-gray-600">You have no active subscriptions.</p>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Unlocked Stories</h2>
        {stories.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {stories.map((story) => (
              <li key={story.id} className="border p-3 rounded shadow-sm">
                <h3 className="font-semibold">{story.title}</h3>
                <p className="text-sm text-gray-600">{story.language} | Grade {story.grade}</p>
                <AudioPlayer src={story.audio_url} />
              </li>
            ))}
          </ul>
        ) : (
          <p>No stories unlocked yet.</p>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Referral Summary</h2>
        <p>You’ve referred <strong>{referrals.length}</strong> users.</p>
        <ul className="mt-2">
          {referrals.map((ref) => (
            <li key={ref.id} className="text-sm">
              - {ref.referred_email} ({ref.status})
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Promotions</h2>
        <ul>
          {promotions.map((promo) => (
            <li key={promo.id} className="text-sm">
              - {promo.content} (Status: {promo.status})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
} 
