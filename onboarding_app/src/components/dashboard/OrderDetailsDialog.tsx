"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { ExportButton } from "@/components/dashboard/ExportButton";
import {
  buildOrderDetailRows,
  ORDER_DETAIL_COLUMNS,
} from "@/lib/order-export";
import type { OrderType } from "@ordersync/types";
import {
  formatCurrency,
  formatOrderDate,
  ORDER_STATUS_CONFIG,
  OrderStatusBadge,
} from "./OrderLookupTable";

const TIMELINE_LABELS: Record<string, string> = {
  placedAt: "Placed At",
  acceptedAt: "Accepted At",
  preparingAt: "Preparing At",
  readyAt: "Ready At",
  reservedAt: "Reserved At",
  pickedUpAt: "Picked Up At",
  onRouteAt: "On Route At",
  deliveredAt: "Delivered At",
  feedbackAt: "Feedback At",
  canceledAt: "Canceled At",
  rejectedAt: "Rejected At",
  voidedAt: "Voided At",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4">
      <h4 className="text-sm font-semibold text-foreground mb-3">{title}</h4>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {label}
      </span>
      <span className="text-sm text-foreground text-right break-all">
        {value ?? "—"}
      </span>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      {"☆".repeat(Math.max(0, 5 - rating))}
    </span>
  );
}

interface OrderDetailsDialogProps {
  order: OrderType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteRequest?: () => void;
}

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
  onDeleteRequest,
}: OrderDetailsDialogProps) {
  if (!order) return null;

  const history = [...(order.status?.history ?? [])].reverse();
  const timelineEntries = Object.entries(order.timeline ?? {}).filter(
    ([, ts]) => typeof ts === "number" && ts > 0,
  ) as [string, number][];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 flex-wrap">
            <span>Order #{order.orderNumber}</span>
            <OrderStatusBadge status={order.status?.current} />
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {order.id}
          </DialogDescription>
        </DialogHeader>

        {order.status?.cancellationReason && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            <p className="text-xs font-medium text-destructive mb-1">
              Cancellation Reason
            </p>
            <p className="text-sm text-foreground">
              {order.status.cancellationReason}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Section title="Customer">
            <InfoRow label="Name" value={order.customer?.name} />
            <InfoRow label="Phone" value={order.customer?.phone} />
            {order.customer?.secondPhone && (
              <InfoRow label="Second Phone" value={order.customer.secondPhone} />
            )}
            <InfoRow label="Customer UID" value={order.customerUid} />
            <InfoRow
              label="First Order"
              value={formatOrderDate(order.customer?.firstOrderDate)}
            />
            <InfoRow
              label="Lifetime Orders"
              value={order.customer?.totalOrders ?? 0}
            />
            <InfoRow
              label="Lifetime Value"
              value={formatCurrency(order.customer?.totalOrdersValue ?? 0)}
            />
          </Section>

          <Section title="Restaurant">
            <InfoRow label="Name" value={order.business?.name} />
            {order.business?.nameInAr && (
              <InfoRow label="Name (AR)" value={order.business.nameInAr} />
            )}
            <InfoRow label="Phone" value={order.business?.phone} />
            <InfoRow label="Address" value={order.business?.address} />
            <InfoRow label="Business ID" value={order.businessId} />
          </Section>

          <Section title="Delivery">
            <InfoRow label="Address" value={order.delivery?.address} />
            <InfoRow label="Note" value={order.delivery?.note || "—"} />
            {order.delivery?.latlng && (
              <InfoRow
                label="Coordinates"
                value={`${order.delivery.latlng[0]}, ${order.delivery.latlng[1]}`}
              />
            )}
          </Section>

          <Section title="Assignment & Payment">
            <InfoRow
              label="Driver UID"
              value={
                order.assignment?.driverUid ? (
                  <span className="font-mono text-xs">
                    {order.assignment.driverUid}
                  </span>
                ) : (
                  <Badge variant="outline">Unassigned</Badge>
                )
              }
            />
            {order.assignment?.reservedUntil ? (
              <InfoRow
                label="Reserved Until"
                value={formatOrderDate(order.assignment.reservedUntil)}
              />
            ) : null}
            <InfoRow label="Payment Method" value={order.payment?.method} />
            <InfoRow label="Payment Status" value={order.payment?.status} />
            <InfoRow label="Order Source" value={order.metadata?.orderSource} />
          </Section>

          <Section title="Pricing">
            <InfoRow
              label="Subtotal"
              value={formatCurrency(order.pricing?.subtotal ?? 0)}
            />
            <InfoRow
              label="Discount"
              value={formatCurrency(order.pricing?.discount ?? 0)}
            />
            <InfoRow
              label="Delivery Fees"
              value={formatCurrency(order.pricing?.deliveryFees ?? 0)}
            />
            <div className="border-t border-border mt-2 pt-2">
              <InfoRow
                label="Total"
                value={
                  <span className="font-semibold">
                    {formatCurrency(order.pricing?.total ?? 0)}
                  </span>
                }
              />
            </div>
          </Section>

          <Section title="Finance">
            <InfoRow
              label={`Commission (${order.finance?.commissionPercent ?? 0}%)`}
              value={formatCurrency(order.finance?.commissionAmount ?? 0)}
            />
            <InfoRow
              label="Restaurant Share"
              value={formatCurrency(order.finance?.restaurantShare ?? 0)}
            />
            <InfoRow
              label="Company Share"
              value={formatCurrency(order.finance?.companyShare ?? 0)}
            />
            <InfoRow
              label="Cash Collected"
              value={formatCurrency(order.finance?.cashCollected ?? 0)}
            />
            <InfoRow
              label="Driver Earnings"
              value={formatCurrency(order.finance?.driverEarnings ?? 0)}
            />
            <InfoRow
              label="Wallet Redeemed"
              value={formatCurrency(order.pricing?.walletRedeemed ?? 0)}
            />
            <InfoRow
              label="Cashback Earned"
              value={formatCurrency(order.pricing?.cashbackEarned ?? 0)}
            />
          </Section>

          <Section title={`Cart Items (${order.cart?.length ?? 0})`}>
            {order.cart?.length ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-8 text-xs">Item</TableHead>
                    <TableHead className="h-8 text-xs">Size</TableHead>
                    <TableHead className="h-8 text-xs">Qty</TableHead>
                    {order.cart.some((item) => item.discountCode) && (
                      <TableHead className="h-8 text-xs">Discount</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.cart.map((item) => (
                    <TableRow key={`${item.id}-${item.selectedSize}`} className="hover:bg-transparent">
                      <TableCell className="py-1.5 text-sm">
                        {item.name}
                      </TableCell>
                      <TableCell className="py-1.5 text-sm text-muted-foreground">
                        {item.selectedSize}
                      </TableCell>
                      <TableCell className="py-1.5 text-sm">
                        {item.quantity}
                      </TableCell>
                      {order.cart.some((i) => i.discountCode) && (
                        <TableCell className="py-1.5 text-sm text-muted-foreground">
                          {item.discountCode || "—"}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No items</p>
            )}
          </Section>

          <Section title="Status History">
            {history.length ? (
              <ol className="space-y-3">
                {history.map((entry, index) => (
                  <li key={`${entry.status}-${entry.timestamp}-${index}`} className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                        index === 0 ? "bg-primary" : "bg-muted-foreground/40"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {ORDER_STATUS_CONFIG_LABELS[entry.status] ?? entry.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatOrderDate(entry.timestamp)} · by{" "}
                        <span className="font-mono">{entry.by}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No history recorded</p>
            )}
          </Section>

          <Section title="Lifecycle Timeline">
            {timelineEntries.length ? (
              timelineEntries.map(([key, ts]) => (
                <InfoRow key={key} label={TIMELINE_LABELS[key] ?? key} value={formatOrderDate(ts)} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No timestamps</p>
            )}
          </Section>

          {order.customerFeedback && (
            <Section title="Customer Feedback">
              <InfoRow
                label="Rating"
                value={<Stars rating={order.customerFeedback.rating} />}
              />
              {order.customerFeedback.comment && (
                <InfoRow label="Comment" value={order.customerFeedback.comment} />
              )}
            </Section>
          )}

          <Section title="Notes & Metadata">
            <InfoRow label="Order Note" value={order.notes?.order || "—"} />
            <InfoRow label="Created At" value={formatOrderDate(order.createdAt)} />
            <InfoRow label="Updated At" value={formatOrderDate(order.updatedAt)} />
          </Section>
        </div>

        <DialogFooter className="mt-6 border-t border-border pt-4 sm:justify-between">
          <ExportButton
            data={buildOrderDetailRows(order)}
            columns={ORDER_DETAIL_COLUMNS}
            rawJSON={order}
            filename={`order-${order.orderNumber}`}
            sheetName="Order Details"
            title={`Order #${order.orderNumber} — Details`}
          />
          {onDeleteRequest && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/40"
              onClick={onDeleteRequest}
            >
              <Trash2 className="h-4 w-4" />
              Delete Order
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ORDER_STATUS_CONFIG_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => [key, cfg.label]),
);
