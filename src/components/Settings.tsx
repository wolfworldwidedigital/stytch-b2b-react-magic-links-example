import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import './Settings.css';
import { useStytchMemberSession } from '@stytch/react/b2b';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { session, fromCache } = useStytchMemberSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'authentication' | 'members'>(
    'authentication'
  );
  const [jitProvisioningEnabled, setJitProvisioningEnabled] = useState(false);
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const initialLoadComplete = useRef(false);
  const pendingUpdateRef = useRef(false);

  useEffect(() => {
    if (!session && !fromCache) {
      console.log('No session found, redirecting...');
      navigate('/');
    }
  }, [fromCache, navigate, session]);

  const role = useMemo(() => {
    return session?.roles.includes('stytch_admin') ? 'admin' : 'member';
  }, [session?.roles]);

  useEffect(() => {
    if (session) {
      const organizationId = session.organization_id;

      const fetchSettingsData = async () => {
        try {
          const response = await axios.get(
            `/api/organizations/${organizationId}`
          );
          setJitProvisioningEnabled(response.data.jitProvisioningEnabled);
          setAllowedDomains(response.data.allowedDomains);
          initialLoadComplete.current = true;
        } catch (e) {
          console.error('Error fetching settings:', e);
        }
      };

      const fetchMembersData = async () => {
        try {
          const response = await axios.get(
            `/api/organizations/${organizationId}/members`
          );
          setMembers(response.data);
        } catch (e) {
          console.error('Error fetching members:', e);
        }
      };

      fetchSettingsData();
      fetchMembersData();
    }
  }, [session]);

  const showToastNotification = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const saveSettings = async () => {
    if (session) {
      const organizationId = session.organization_id;

      try {
        await axios.put(`/api/organizations/${organizationId}`, {
          jitProvisioningEnabled,
          allowedDomains,
        });
        showToastNotification();
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }
  };

  useEffect(() => {
    if (initialLoadComplete.current && pendingUpdateRef.current) {
      saveSettings();
      pendingUpdateRef.current = false;
    }
  }, [jitProvisioningEnabled, allowedDomains]);

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJitProvisioningEnabled(e.target.checked);
    pendingUpdateRef.current = true;
  };

  const addDomain = () => {
    if (newDomain && !allowedDomains.includes(newDomain)) {
      setAllowedDomains([...allowedDomains, newDomain]);
      setNewDomain('');
      pendingUpdateRef.current = true;
    }
  };

  const removeDomain = (domain: string) => {
    setAllowedDomains(allowedDomains.filter((d) => d !== domain));
    pendingUpdateRef.current = true;
  };

  const deleteMember = async (memberId: string) => {
    if (session) {
      const organizationId = session.organization_id;

      try {
        await axios.delete(
          `/api/organizations/${organizationId}/members/${memberId}`
        );

        setMembers(members.filter((member) => member.member_id !== memberId));
        showToastNotification();
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>
      <div className="settings-menu">
        <div
          className={`settings-menu-item ${
            activeTab === 'authentication' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('authentication')}
        >
          Authentication Settings
        </div>
        <div
          className={`settings-menu-item ${
            activeTab === 'members' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('members')}
        >
          Member Settings
        </div>
      </div>
      {activeTab === 'authentication' && (
        <div className="settings-card">
          <h2>JIT Provisioning</h2>
          <p className="subheader">
            Just in time (JIT) provisioning allows anyone to sign up and join
            your organization if their email address matches an allow listed
            domain (e.g. example.com). Common email domains such as gmail.com
            are not allowed.
          </p>
          <div className="setting-item">
            <label className="toggle-label">Enable JIT Provisioning</label>
            <label className={`switch ${role !== 'admin' ? 'disabled' : ''}`}>
              <input
                type="checkbox"
                checked={jitProvisioningEnabled}
                onChange={handleToggleChange}
                disabled={role !== 'admin'}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="setting-item">
            <label className="domains-label">Allowed Email Domains</label>
            <div className="domains">
              {allowedDomains.map((domain, index) => (
                <div key={index} className="domain-chip">
                  {domain}
                  {role === 'admin' && (
                    <button onClick={() => removeDomain(domain)}>x</button>
                  )}
                </div>
              ))}
            </div>
            {role === 'admin' && (
              <div className="add-domain-container">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="Add a domain"
                />
                <button onClick={addDomain} className="add-button">
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'members' && (
        <div className="settings-card">
          <h2>Member Settings</h2>
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                {role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.member_id}>
                  <td>{member.name}</td>
                  <td>{member.email_address}</td>
                  <td>
                    {member.roles.map((role: any, index: number) => (
                      <span key={index} className="role-chip">
                        {role.role_id}
                      </span>
                    ))}
                  </td>
                  {role === 'admin' && (
                    <td>
                      <span
                        onClick={() => deleteMember(member.member_id)}
                        className="delete-member"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showToast && <div className="toast">Your changes have been saved</div>}
    </div>
  );
};

export default Settings;
