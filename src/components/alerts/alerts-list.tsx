import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";

type AlertRow = {
  id: string;
  alert_type: string;
  threshold: number;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  products: {
    name: string;
    competitor: string;
    sku: string | null;
  };
};

type AlertsListProps = {
  alerts: AlertRow[];
};

function formatAlertType(type: string) {
  if (type === "below") return "Price below";
  if (type === "above") return "Price above";
  return "Change %";
}

function formatThreshold(type: string, threshold: number) {
  if (type === "change_percent") return `${threshold}%`;
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(threshold);
}

export function AlertsList({ alerts }: AlertsListProps) {
  return (
    <div className="rounded-tremor-default border border-dark-tremor-border bg-dark-tremor-background p-6 shadow-dark-tremor-card">
      <h3 className="font-medium text-dark-tremor-content-strong">
        Active alert rules
      </h3>
      <p className="text-tremor-default text-dark-tremor-content">
        Rules evaluated automatically after each scrape run.
      </p>

      <div className="mt-6">
        {alerts.length === 0 ? (
          <p className="text-tremor-default text-dark-tremor-content">
            No alerts configured yet.
          </p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Product</TableHeaderCell>
                <TableHeaderCell>Competitor</TableHeaderCell>
                <TableHeaderCell>Rule</TableHeaderCell>
                <TableHeaderCell>Threshold</TableHeaderCell>
                <TableHeaderCell>Last triggered</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium text-dark-tremor-content-strong">
                    {alert.products.name}
                  </TableCell>
                  <TableCell>{alert.products.competitor}</TableCell>
                  <TableCell>{formatAlertType(alert.alert_type)}</TableCell>
                  <TableCell>
                    {formatThreshold(alert.alert_type, Number(alert.threshold))}
                  </TableCell>
                  <TableCell>
                    {alert.last_triggered_at
                      ? new Intl.DateTimeFormat("en-IE", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(alert.last_triggered_at))
                      : "Never"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
