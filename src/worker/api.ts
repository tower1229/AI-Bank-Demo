import { getDashboard, getHealth, getSeedStatus } from "../bank/dashboard";
import {
  approveOnboardingApplication,
  createOnboardingApplication,
  createTransfer,
  deleteCustomerDemoData,
  getCustomerPortfolio,
  getOnboardingApplication,
  listAuditLogs,
  listOnboardingApplications,
  listPaymentInstructions,
  listProducts,
  purchaseProduct,
  rejectOnboardingApplication,
  resetDemoData,
  searchCustomers,
  type ApproveOnboardingApplicationInput,
  type CreateOnboardingApplicationInput,
  type CreateTransferInput,
  type DeleteCustomerDemoDataInput,
  type OperationContext,
  type PurchaseProductInput,
  type RejectOnboardingApplicationInput,
  type ResetDemoDataInput
} from "../bank/service";
import { json, methodNotAllowed, notFound, readJson, serverError } from "./http";

const webContext: OperationContext = {
  source: "manual_web",
  operatorId: "demo-operator",
  operatorDisplayName: "Demo Operator"
};

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      return json({
        ok: true,
        data: await getHealth(env.DB),
        displayMessage: "Core Bank System API and D1 are reachable."
      });
    }

    if (request.method === "GET" && url.pathname === "/api/seed/status") {
      const seedStatus = await getSeedStatus(env.DB);

      return json({
        ok: true,
        data: seedStatus,
        displayMessage: seedStatus.seeded
          ? "Seed data is available."
          : "Seed data is missing or incomplete."
      });
    }

    if (request.method === "POST" && url.pathname === "/api/demo/reset") {
      const body = await readJson<ResetDemoDataInput>(request);
      const result = await resetDemoData(env.DB, body, {
        ...webContext,
        confirmationText: body.confirmed ? "Manual web seed reset confirmation" : undefined
      });

      return json({
        ok: true,
        data: result,
        displayMessage: result.displayMessage
      });
    }

    if (request.method === "GET" && url.pathname === "/api/dashboard") {
      return json({
        ok: true,
        data: await getDashboard(env.DB),
        displayMessage: "Dashboard data loaded."
      });
    }

    if (request.method === "POST" && url.pathname === "/api/onboarding/applications") {
      const body = await readJson<CreateOnboardingApplicationInput>(request);
      const result = await createOnboardingApplication(env.DB, body, {
        ...webContext,
        confirmationText: body.confirmed ? "Manual web confirmation" : undefined
      });

      return json({
        ok: true,
        data: result.application,
        displayMessage: result.displayMessage
      });
    }

    if (request.method === "GET" && url.pathname === "/api/onboarding/applications") {
      return json({
        ok: true,
        data: await listOnboardingApplications(env.DB),
        displayMessage: "Onboarding applications loaded."
      });
    }

    const onboardingDetailMatch = url.pathname.match(/^\/api\/onboarding\/applications\/([^/]+)$/);
    if (onboardingDetailMatch) {
      if (request.method !== "GET") {
        return methodNotAllowed(request.method);
      }

      return json({
        ok: true,
        data: await getOnboardingApplication(env.DB, onboardingDetailMatch[1]),
        displayMessage: "Onboarding application loaded."
      });
    }

    const onboardingApproveMatch = url.pathname.match(/^\/api\/onboarding\/applications\/([^/]+)\/approve$/);
    if (onboardingApproveMatch) {
      if (request.method !== "POST") {
        return methodNotAllowed(request.method);
      }

      const body = await readJson<Omit<ApproveOnboardingApplicationInput, "applicationId">>(request);
      const result = await approveOnboardingApplication(
        env.DB,
        { ...body, applicationId: onboardingApproveMatch[1] },
        {
          ...webContext,
          confirmationText: body.confirmed ? "Manual web approval confirmation" : undefined
        }
      );

      return json({
        ok: true,
        data: result.application,
        displayMessage: result.displayMessage
      });
    }

    const onboardingRejectMatch = url.pathname.match(/^\/api\/onboarding\/applications\/([^/]+)\/reject$/);
    if (onboardingRejectMatch) {
      if (request.method !== "POST") {
        return methodNotAllowed(request.method);
      }

      const body = await readJson<Omit<RejectOnboardingApplicationInput, "applicationId">>(request);
      const result = await rejectOnboardingApplication(
        env.DB,
        { ...body, applicationId: onboardingRejectMatch[1] },
        {
          ...webContext,
          confirmationText: body.confirmed ? "Manual web rejection confirmation" : undefined
        }
      );

      return json({
        ok: true,
        data: result.application,
        displayMessage: result.displayMessage
      });
    }

    if (request.method === "GET" && url.pathname === "/api/customers") {
      return json({
        ok: true,
        data: await searchCustomers(env.DB, url.searchParams.get("query") ?? ""),
        displayMessage: "Customers loaded."
      });
    }

    const customerMatch = url.pathname.match(/^\/api\/customers\/([^/]+)$/);
    if (customerMatch) {
      if (request.method !== "DELETE") {
        return methodNotAllowed(request.method);
      }

      const body = await readJson<Omit<DeleteCustomerDemoDataInput, "customerId">>(request);
      const result = await deleteCustomerDemoData(
        env.DB,
        { ...body, customerId: customerMatch[1] },
        {
          ...webContext,
          confirmationText: body.confirmed ? "Manual web customer data reset confirmation" : undefined
        }
      );

      return json({
        ok: true,
        data: result,
        displayMessage: result.displayMessage
      });
    }

    const portfolioMatch = url.pathname.match(/^\/api\/customers\/([^/]+)\/portfolio$/);
    if (portfolioMatch) {
      if (request.method !== "GET") {
        return methodNotAllowed(request.method);
      }

      return json({
        ok: true,
        data: await getCustomerPortfolio(env.DB, portfolioMatch[1]),
        displayMessage: "Customer portfolio loaded."
      });
    }

    if (request.method === "POST" && url.pathname === "/api/transfers") {
      const body = await readJson<CreateTransferInput>(request);
      const result = await createTransfer(env.DB, body, {
        ...webContext,
        confirmationText: body.confirmed ? "Manual web transfer confirmation" : undefined
      });

      return json({
        ok: true,
        data: result,
        displayMessage: result.displayMessage
      });
    }

    if (request.method === "GET" && url.pathname === "/api/transfers") {
      return json({
        ok: true,
        data: await listPaymentInstructions(env.DB),
        displayMessage: "Payment instructions loaded."
      });
    }

    if (request.method === "GET" && url.pathname === "/api/products") {
      return json({
        ok: true,
        data: await listProducts(env.DB),
        displayMessage: "Products loaded."
      });
    }

    if (request.method === "POST" && url.pathname === "/api/product-purchases") {
      const body = await readJson<PurchaseProductInput>(request);
      const result = await purchaseProduct(env.DB, body, {
        ...webContext,
        confirmationText: body.confirmed ? "Manual web product purchase confirmation" : undefined
      });

      return json({
        ok: true,
        data: result,
        displayMessage: result.displayMessage
      });
    }

    if (request.method === "GET" && url.pathname === "/api/audit-logs") {
      return json({
        ok: true,
        data: await listAuditLogs(env.DB),
        displayMessage: "Audit logs loaded."
      });
    }

    if (url.pathname.startsWith("/api/")) {
      const supportedPath =
        url.pathname === "/api/health" ||
        url.pathname === "/api/seed/status" ||
        url.pathname === "/api/demo/reset" ||
        url.pathname === "/api/dashboard" ||
        url.pathname === "/api/onboarding/applications" ||
        url.pathname === "/api/customers" ||
        url.pathname === "/api/transfers" ||
        url.pathname === "/api/products" ||
        url.pathname === "/api/product-purchases" ||
        url.pathname === "/api/audit-logs" ||
        Boolean(onboardingDetailMatch) ||
        Boolean(onboardingApproveMatch) ||
        Boolean(onboardingRejectMatch) ||
        Boolean(customerMatch) ||
        Boolean(portfolioMatch);

      if (supportedPath) {
        return methodNotAllowed(request.method);
      }
    }

    return notFound(url.pathname);
  } catch (error) {
    return serverError(error);
  }
}
