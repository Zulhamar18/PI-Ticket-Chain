{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/validation-key.txt",
      "dest": "/public/validation-key.txt"
    },
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}