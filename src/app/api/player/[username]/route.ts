import { NextRequest, NextResponse } from 'next/server';

const RUNEMETRICS_BASE_URL = 'https://apps.runescape.com/runemetrics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const formattedUsername = username.trim();

  try {
    const encodedUsername = encodeURIComponent(formattedUsername);

    const [profileRes, questsRes] = await Promise.all([
      fetch(`${RUNEMETRICS_BASE_URL}/profile/profile?user=${encodedUsername}&activities=0`, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      }),
      fetch(`${RUNEMETRICS_BASE_URL}/quests?user=${encodedUsername}`, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      }),
    ]);

    if (!profileRes.ok || !questsRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch player data' },
        { status: 500 }
      );
    }

    const [profile, quests] = await Promise.all([
      profileRes.json(),
      questsRes.json(),
    ]);

    if (profile.error === 'NO_PROFILE') {
      return NextResponse.json(
        { error: 'NO_PROFILE', loggedIn: profile.loggedIn },
        { status: 404 }
      );
    }

    if (profile.error === 'PROFILE_PRIVATE') {
      return NextResponse.json(
        { error: 'PROFILE_PRIVATE', loggedIn: profile.loggedIn },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ...profile,
      quests: Array.isArray(quests) ? quests : quests.quests,
    });
  } catch (error) {
    console.error('Error fetching player data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player data' },
      { status: 500 }
    );
  }
}
