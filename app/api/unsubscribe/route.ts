import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find subscriber
    const subscriber = await prisma.subscriber.findUnique({
      where: { email }
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Email not found in our system' },
        { status: 404 }
      );
    }

    // Update to inactive
    await prisma.subscriber.update({
      where: { email },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

// GET endpoint for clicking link in email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Link</title>
            <style>
              body { font-family: system-ui; padding: 40px; text-align: center; }
              .container { max-width: 500px; margin: 0 auto; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Invalid Link</h1>
              <p>This unsubscribe link is invalid or expired.</p>
            </div>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Find and deactivate subscriber
    const subscriber = await prisma.subscriber.findUnique({
      where: { email: decodeURIComponent(email) }
    });

    if (!subscriber) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Not Found</title>
            <style>
              body { font-family: system-ui; padding: 40px; text-align: center; }
              .container { max-width: 500px; margin: 0 auto; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❓ Not Found</h1>
              <p>We couldn't find this email in our system.</p>
            </div>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    await prisma.subscriber.update({
      where: { email: decodeURIComponent(email) },
      data: { isActive: false }
    });

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed</title>
          <style>
            body { 
              font-family: system-ui; 
              padding: 40px; 
              text-align: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { 
              max-width: 500px; 
              background: rgba(255,255,255,0.1);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            h1 { font-size: 48px; margin: 0 0 16px 0; }
            p { font-size: 18px; line-height: 1.6; opacity: 0.9; }
            a { 
              color: white; 
              text-decoration: underline;
              opacity: 0.8;
            }
            a:hover { opacity: 1; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Unsubscribed</h1>
            <p>You've been successfully unsubscribed from TrendWatch AI.</p>
            <p style="font-size: 14px; margin-top: 32px;">
              Changed your mind? <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}">Subscribe again</a>
            </p>
          </div>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('Unsubscribe GET error:', error);
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: system-ui; padding: 40px; text-align: center; }
            .container { max-width: 500px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Error</h1>
            <p>Something went wrong. Please try again later.</p>
          </div>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}