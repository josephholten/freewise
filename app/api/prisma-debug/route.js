// pages/api/prisma-debug.js (for Pages Router)
// or app/api/prisma-debug/route.js (for App Router)

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// For App Router
export async function GET() {
  try {
    const results = await findPrismaEngineFiles();
    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}

async function findPrismaEngineFiles() {
  const rootDir = process.cwd();
  const results = {
    rootDir,
    environment: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      env: process.env.NODE_ENV,
    },
    engineLocations: {},
    prismaGeneratedFolders: [],
    prismaInfo: {}
  };

  // Common locations to check
  const locationsToCheck = [
    'node_modules/.prisma/client',
    'node_modules/@prisma/client',
    'prisma/generated/client',
    'prisma/client',
    '.vercel/output/functions/_middleware.func/node_modules/.prisma/client',
    '.next/server/chunks',
    '.next/server/pages',
  ];

  // Check each location
  for (const location of locationsToCheck) {
    const fullPath = path.join(rootDir, location);
    try {
      const files = await readdir(fullPath);
      const engineFiles = files.filter(file => file.includes('engine') || file.includes('.so') || file.includes('.dll'));
      
      if (engineFiles.length > 0) {
        results.engineLocations[location] = engineFiles;
        
        // Check permissions for each engine file
        for (const engineFile of engineFiles) {
          const filePath = path.join(fullPath, engineFile);
          try {
            const fileStat = await stat(filePath);
            results.engineLocations[`${location}/${engineFile}_permissions`] = {
              mode: fileStat.mode.toString(8).slice(-3),
              size: fileStat.size,
              isExecutable: !!(fileStat.mode & 0o111)
            };
          } catch (error) {
            results.engineLocations[`${location}/${engineFile}_permissions`] = `Error: ${error.message}`;
          }
        }
      }
    } catch (error) {
      results.engineLocations[location] = `Error: ${error.message}`;
    }
  }

  // Find all generated Prisma folders
  try {
    const { stdout: findResult } = await execAsync('find . -type d -path "*/prisma/*" -o -path "*/.prisma/*"');
    results.prismaGeneratedFolders = findResult.split('\n').filter(Boolean);
  } catch (error) {
    results.prismaGeneratedFolders = [`Error: ${error.message}`];
  }

  // Get Prisma version info
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    results.prismaInfo.clientVersion = packageJson.dependencies['@prisma/client'] || 'not found';
    results.prismaInfo.devVersion = packageJson.devDependencies?.prisma || 'not found';
  } catch (error) {
    results.prismaInfo.packageError = error.message;
  }

  // Search for any engine files recursively in node_modules
  try {
    const { stdout: engineSearch } = await execAsync('find ./node_modules -name "*query_engine*" | head -n 20');
    results.engineSearch = engineSearch.split('\n').filter(Boolean);
  } catch (error) {
    results.engineSearch = [`Error: ${error.message}`];
  }

  return results;
}