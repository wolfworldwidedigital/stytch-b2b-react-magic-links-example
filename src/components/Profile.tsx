import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';
import { useStytchMemberSession } from '@stytch/react/b2b';

const Profile: React.FC = () => {
  const { session } = useStytchMemberSession();
  const [activeTab, setActiveTab] = useState('user');
  const [fullName, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        const { member_id: memberId, organization_id: organizationId } =
          session;

        try {
          const res = await axios.get(
            `/api/organizations/${organizationId}/members/${memberId}`
          );

          setName(res.data.name);
          setEmail(res.data.email_address);
        } catch (e) {
          console.error('Error fetching profile:', e);
        }
      }
    };
    fetchProfile();
  }, [session]);

  const handleSave = async () => {
    if (session) {
      const { member_id: memberId, organization_id: organizationId } = session;

      try {
        await axios.put(
          `/api/organizations/${organizationId}/members/${memberId}`,
          {
            fullName,
          }
        );
        console.log('Profile saved successfully');
      } catch (e) {
        console.error('Error saving profile:', e);
      }
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">Profile</h1>
      <div className="profile-menu">
        <div
          className={`profile-menu-item ${
            activeTab === 'user' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('user')}
        >
          User Settings
        </div>
      </div>
      {activeTab === 'user' && (
        <div className="profile-card">
          <h2>User Settings</h2>
          <div className="profile-item">
            <label>Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="profile-item">
            <label>Email</label>
            <input type="text" value={email} disabled />
          </div>
          <button onClick={handleSave} className="save-button">
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
