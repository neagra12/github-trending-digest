import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, languages, frequency } = body;

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!languages || languages.length === 0) {
      return NextResponse.json(
        { error: 'At least one language must be selected' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.subscriber.findUnique({
      where: { email }
    });

    if (existing) {
      // Update existing subscription
      const updated = await prisma.subscriber.update({
        where: { email },
        data: {
          languages,
          frequency,
          isActive: true,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Subscription updated successfully',
        subscriber: updated
      });
    }

    // Create new subscription
    const subscriber = await prisma.subscriber.create({
      data: {
        email,
        languages,
        frequency: frequency || 'daily'
      }
    });

    return NextResponse.json({
      message: 'Subscribed successfully',
      subscriber
    }, { status: 201 });

  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check subscription status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { email }
    });

    if (!subscriber) {
      return NextResponse.json(
        { subscribed: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscribed: true,
      subscriber: {
        email: subscriber.email,
        languages: subscriber.languages,
        frequency: subscriber.frequency,
        isActive: subscriber.isActive
      }
    });

  } catch (error) {
    console.error('Check subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}