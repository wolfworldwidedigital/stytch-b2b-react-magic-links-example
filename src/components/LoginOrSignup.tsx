import { StytchB2B } from "@stytch/react/b2b";
import { AuthFlowType, B2BProducts } from "@stytch/vanilla-js";

export const LoginOrSignup = () => {
  const config = {
    products: [B2BProducts.emailMagicLinks],
    sessionOptions: { sessionDurationMinutes: 60 },
    authFlowType: AuthFlowType.Discovery,
  };

  return (
    <div className="centered-login">
      <StytchB2B config={config} />
    </div>
  );
};
