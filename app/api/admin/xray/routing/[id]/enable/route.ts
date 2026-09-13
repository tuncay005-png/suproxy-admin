import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  // TODO: Implement routing enable endpoint
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}
