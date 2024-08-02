import { useStytchMemberSession } from "@stytch/react/b2b";

export const Dashboard: React.FC = () => {
  const { session } = useStytchMemberSession();

  const role = session?.roles.includes("stytch_admin") ? "admin" : "member";

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
      Hallo! Je bent ingelogd met <strong>{role}</strong> rechten.
      </div>
    </div>
  );
};
