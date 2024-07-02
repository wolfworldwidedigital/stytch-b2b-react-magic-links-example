import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as Stytch from 'stytch';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { loadEnv } from 'vite';

dotenv.config();
const app = express();
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(cookieParser());

const { VITE_STYTCH_PROJECT_ID: projectId, STYTCH_SECRET: secret } = loadEnv(
  '',
  process.cwd(),
  ''
);

if (!projectId || !secret) {
  throw new Error(
    'Missing required environment variables: VITE_STYTCH_PROJECT_ID and STYTCH_SECRET'
  );
}

const stytchClient = new Stytch.B2BClient({
  project_id: projectId,
  secret: secret,
});

app.get('/api/organizations/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;

    if (!organizationId) {
      return res.status(400).json({ error: 'Missing organizationId' });
    }

    // Fetch organization settings from Stytch
    const response = await stytchClient.organizations.get({
      organization_id: organizationId,
    });

    const { email_allowed_domains, email_jit_provisioning } =
      response.organization;
    const jitProvisioningEnabled =
      email_jit_provisioning == 'NOT_ALLOWED' ? false : true;

    res.json({ jitProvisioningEnabled, allowedDomains: email_allowed_domains });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/organizations/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { jitProvisioningEnabled, allowedDomains } = req.body;

    if (!organizationId) {
      return res.status(400).json({ error: 'Missing organizationId' });
    }

    const options = {
      authorization: {
        session_token: req.cookies['stytch_session'],
      },
    };

    await stytchClient.organizations.update(
      {
        organization_id: organizationId,
        email_allowed_domains: allowedDomains,
        email_jit_provisioning: jitProvisioningEnabled
          ? 'RESTRICTED'
          : 'NOT_ALLOWED',
      },
      options
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.get('/api/organizations/:organizationId/members', async (req, res) => {
  try {
    const { organizationId } = req.params;

    if (!organizationId) {
      return res.status(400).json({ error: 'Missing organizationId' });
    }

    const response = await stytchClient.organizations.members.search({
      organization_ids: [organizationId],
    });

    res.json(response.members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

app.delete(
  '/api/organizations/:organizationId/members/:memberId',
  async (req, res) => {
    try {
      const { memberId, organizationId } = req.params;

      if (!memberId || !organizationId) {
        return res
          .status(400)
          .json({ error: 'Missing memberId or organizationId' });
      }

      const options = {
        authorization: {
          session_token: req.cookies['stytch_session'],
        },
      };

      await stytchClient.organizations.members.delete(
        {
          member_id: memberId,
          organization_id: organizationId,
        },
        options
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting member:', error);
      res.status(500).json({ error: 'Failed to delete member' });
    }
  }
);

app.get(
  '/api/organizations/:organizationId/members/:memberId',
  async (req, res) => {
    const { memberId, organizationId } = req.params;
    if (!memberId || !organizationId) {
      return res
        .status(400)
        .json({ error: 'Missing memberId or organizationId' });
    }

    const response = await stytchClient.organizations.members.get({
      member_id: memberId,
      organization_id: organizationId,
    });

    const { name, email_address } = response.member;

    res.send({
      name,
      email_address,
    });
  }
);

app.put(
  '/api/organizations/:organizationId/members/:memberId',
  async (req, res) => {
    try {
      const { memberId, organizationId } = req.params;
      const { fullName } = req.body;

      if (!memberId || !organizationId) {
        return res
          .status(400)
          .json({ error: 'Missing memberId or organizationId' });
      }

      const response = await stytchClient.organizations.members.get({
        member_id: memberId,
        organization_id: organizationId,
      });

      const { name, email_address } = response.member;

      if (fullName) {
        const options = {
          authorization: {
            session_token: req.cookies['stytch_session'],
          },
        };

        await stytchClient.organizations.members.update(
          {
            member_id: memberId,
            organization_id: organizationId,
            name: fullName,
          },
          options
        );
      }

      res.json({ name: name || fullName, email_address });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
);

app.use(express.static(path.join(__dirname, '../../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
