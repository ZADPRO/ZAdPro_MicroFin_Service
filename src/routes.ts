import * as Hapi from "@hapi/hapi";
import { adminRoutes } from "./api/admin/routes";
import { rePaymentRoutes } from "./api/repayment/routes";
import { newLoanRoutes } from "./api/newLoan/routes";
import { refDashboardRoutes } from "./api/dashboard/routes";
import { fundRoutes } from "./api/fund/routes";
import { adminLoanVendorRoutes } from "./api/adminLoanVendor/routes";
import { adminLoanCreationRoutes } from "./api/adminLoanCreation/routes";
import { AdminRePaymentRoutes } from "./api/AdminLoanRepayment/routes";
import { expenseRoutes } from "./api/expense/routes";
import { ReportRoutes } from "./api/Report/routes";
import { CashFlowRoutes } from "./api/CashFlow/routes";
import { AreaRoutes } from "./api/Area/routes";
import { SettingsRoutes } from "./api/Settings/routes";
import { CustomerRepaymentRoutes } from "./api/CustomerRepayment/routes";
import { ProductRoutes } from "./api/LoanProduct/routes";
import { openClosingBalRoutes } from "./api/OpenClosingBalance/routes";
export default class Router {
  public static async loadRoutes(server: Hapi.Server): Promise<any> {
    await new adminRoutes().register(server);
    await new rePaymentRoutes().register(server);
    await new refDashboardRoutes().register(server);
    await new newLoanRoutes().register(server);
    await new fundRoutes().register(server);
    await new adminLoanVendorRoutes().register(server);
    await new adminLoanCreationRoutes().register(server);
    await new AdminRePaymentRoutes().register(server);
    await new expenseRoutes().register(server);
    await new ReportRoutes().register(server);
    await new CashFlowRoutes().register(server);
    await new AreaRoutes().register(server);
    await new SettingsRoutes().register(server);
    await new CustomerRepaymentRoutes().register(server);
    await new ProductRoutes().register(server);
    await new openClosingBalRoutes().register(server);
  }
}
