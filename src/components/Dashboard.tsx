import { useStytchMemberSession } from "@stytch/react/b2b";

export const Dashboard: React.FC = () => {
  const { session } = useStytchMemberSession();

  const role = session?.roles.includes("stytch_admin") ? "admin" : "member";

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        Hello! You're logged in with <strong>{role}</strong> permissions.
      </div>
    </div>
  );
};
