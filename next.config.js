/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Skip bundling this optional package — only used at runtime when
    // ANTHROPIC_API_KEY is set. The API route falls back to mock if absent.
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
  },
}

module.exports = nextConfig
