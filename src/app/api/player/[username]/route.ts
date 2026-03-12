import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  // Replace spaces with underscores for the RS3 API
  const formattedUsername = username.replace(/ /g, '_');

  try {
    // Fetch levels and quests in parallel
    const [levelsRes, questsRes] = await Promise.all([
      fetch(`https://api.rs3.dev/api/v1/players/${encodeURIComponent(formattedUsername)}/levels`, {
        headers: { 'Accept': 'application/json' },
      }),
      fetch(`https://api.rs3.dev/api/v1/players/${encodeURIComponent(formattedUsername)}/quests`, {
        headers: { 'Accept': 'application/json' },
      }),
    ]);

    if (levelsRes.status === 404) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    if (!levelsRes.ok || !questsRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch player data' },
        { status: 500 }
      );
    }

    const [levels, quests] = await Promise.all([
      levelsRes.json(),
      questsRes.json(),
    ]);

    return NextResponse.json({ levels, quests });
  } catch (error) {
    console.error('Error fetching player data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player data' },
      { status: 500 }
    );
  }
}
