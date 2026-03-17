import { NextRequest, NextResponse } from "next/server";
import { encryptPrivateKey } from "@/lib/utils/encryption";

/**
 * POST /api/admin/encrypt-key
 * Encrypt a Starknet private key for secure storage
 *
 * SECURITY: This is an admin-only endpoint for initial setup
 * Should be disabled in production or protected with authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Check if encryption key is set
    const encryptionKey = process.env.WALLET_ENCRYPTION_SECRET || process.env.ENCRYPTION_KEY;

    if (!encryptionKey) {
      return NextResponse.json(
        {
          error: "Encryption key not configured",
          message: "Please set WALLET_ENCRYPTION_SECRET or ENCRYPTION_KEY in your environment variables",
          hint: "Generate one with: openssl rand -hex 32",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { privateKey, walletAddress } = body;

    // Validate private key
    if (!privateKey) {
      return NextResponse.json(
        { error: "privateKey is required" },
        { status: 400 }
      );
    }

    if (!privateKey.startsWith("0x") || privateKey.length < 60) {
      return NextResponse.json(
        {
          error: "Invalid private key format",
          message: "Private key must start with 0x and be at least 60 characters",
        },
        { status: 400 }
      );
    }

    // Encrypt the private key
    const encryptedKey = encryptPrivateKey(privateKey);

    // Return the encrypted key and setup instructions
    return NextResponse.json({
      success: true,
      encryptedKey,
      walletAddress: walletAddress || "Not provided",
      setupInstructions: {
        step1: "Add these to your .env file:",
        envVars: {
          STARKNET_HOUSE_WALLET_ADDRESS: walletAddress || "0x...",
          ENCRYPTED_STARKNET_HOUSE_WALLET_KEY: encryptedKey,
          NEXT_PUBLIC_STARKNET_NETWORK: "mainnet",
        },
        step2: "Restart your development server",
        step3: "Test the setup with: npm run security:test",
        security: "⚠️ Never commit your .env file to Git!",
      },
    });
  } catch (error) {
    console.error("Encryption error:", error);
    return NextResponse.json(
      {
        error: "Encryption failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/encrypt-key
 * Returns a simple form for encrypting keys
 */
export async function GET() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Starknet Key Encryption</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 600px;
      width: 100%;
      padding: 40px;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 28px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      color: #333;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }
    input, textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      font-family: 'Courier New', monospace;
      transition: border-color 0.3s;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: #667eea;
    }
    textarea {
      resize: vertical;
      min-height: 80px;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
    }
    button:active {
      transform: translateY(0);
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .result {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #28a745;
      display: none;
    }
    .result.show {
      display: block;
    }
    .result h2 {
      color: #28a745;
      margin-bottom: 15px;
      font-size: 20px;
    }
    .env-block {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 15px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      overflow-x: auto;
      margin-bottom: 15px;
    }
    .env-block code {
      display: block;
      white-space: pre;
    }
    .copy-btn {
      background: #28a745;
      padding: 8px 16px;
      font-size: 13px;
      margin-top: 10px;
      width: auto;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin-top: 20px;
      border-radius: 6px;
      color: #856404;
    }
    .warning strong {
      display: block;
      margin-bottom: 5px;
    }
    .error {
      background: #f8d7da;
      border-left: 4px solid #dc3545;
      padding: 15px;
      margin-top: 20px;
      border-radius: 6px;
      color: #721c24;
      display: none;
    }
    .error.show {
      display: block;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
      display: inline-block;
      margin-left: 10px;
      display: none;
    }
    .spinner.show {
      display: inline-block;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔐 Starknet Key Encryption</h1>
    <p class="subtitle">Encrypt your Starknet house wallet private key for secure storage</p>

    <form id="encryptForm">
      <div class="form-group">
        <label for="walletAddress">Starknet Wallet Address (optional)</label>
        <input
          type="text"
          id="walletAddress"
          placeholder="0x5764bad3e18ab572a9b96c092624a1de389dd726ab78e34965f9d87f416b611"
        />
      </div>

      <div class="form-group">
        <label for="privateKey">Starknet Private Key *</label>
        <textarea
          id="privateKey"
          placeholder="0x..."
          required
        ></textarea>
      </div>

      <button type="submit">
        Encrypt Private Key
        <div class="spinner" id="spinner"></div>
      </button>
    </form>

    <div class="error" id="error"></div>

    <div class="result" id="result">
      <h2>✅ Encryption Successful!</h2>
      <p style="margin-bottom: 15px;">Add these to your <code>.env</code> file:</p>

      <div class="env-block">
        <code id="envVars"></code>
      </div>

      <button class="copy-btn" onclick="copyToClipboard()">📋 Copy to Clipboard</button>

      <div class="warning">
        <strong>⚠️ Security Warning</strong>
        <ul style="margin-left: 20px; margin-top: 5px;">
          <li>Never commit your .env file to Git</li>
          <li>Keep the encrypted key secure</li>
          <li>Use environment variables in production (Vercel Secrets, etc.)</li>
        </ul>
      </div>
    </div>
  </div>

  <script>
    const form = document.getElementById('encryptForm');
    const result = document.getElementById('result');
    const error = document.getElementById('error');
    const spinner = document.getElementById('spinner');
    const envVars = document.getElementById('envVars');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const privateKey = document.getElementById('privateKey').value.trim();
      const walletAddress = document.getElementById('walletAddress').value.trim();

      // Hide previous results
      result.classList.remove('show');
      error.classList.remove('show');

      // Show spinner
      spinner.classList.add('show');
      form.querySelector('button').disabled = true;

      try {
        const response = await fetch('/api/admin/encrypt-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ privateKey, walletAddress })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.message || 'Encryption failed');
        }

        // Show result
        const envText = \`STARKNET_HOUSE_WALLET_ADDRESS=\${data.setupInstructions.envVars.STARKNET_HOUSE_WALLET_ADDRESS}
ENCRYPTED_STARKNET_HOUSE_WALLET_KEY=\${data.setupInstructions.envVars.ENCRYPTED_STARKNET_HOUSE_WALLET_KEY}
NEXT_PUBLIC_STARKNET_NETWORK=\${data.setupInstructions.envVars.NEXT_PUBLIC_STARKNET_NETWORK}\`;

        envVars.textContent = envText;
        result.classList.add('show');

        // Clear form
        document.getElementById('privateKey').value = '';

      } catch (err) {
        error.textContent = '❌ ' + err.message;
        error.classList.add('show');
      } finally {
        spinner.classList.remove('show');
        form.querySelector('button').disabled = false;
      }
    });

    function copyToClipboard() {
      const text = envVars.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      });
    }
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
