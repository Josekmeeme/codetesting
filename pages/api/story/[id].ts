export const useStoryAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const verify = async (storyId: string) => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    const res = await fetch('/api/stories/verify-access.ts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storyId }),
    });

    const data = await res.json();
    setHasAccess(data.access || false);
    setLoading(false);
    return data;
  };

  return { hasAccess, loading, verify };
}; 
