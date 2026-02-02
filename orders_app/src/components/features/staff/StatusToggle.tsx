"use client";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import useStaff from "@/hooks/useStaff";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  driverId: z.string(),
  status: z.boolean(),
});

export type FormSchemaToggle = z.infer<typeof formSchema>;

export default function StatusToggle({
  driverId,
  status,
}: {
  driverId: string;
  status: boolean;
}) {
  const { toggleMemberStatus } = useStaff();
  const { control, handleSubmit } = useForm<FormSchemaToggle>({
    resolver: zodResolver(formSchema),
    defaultValues: { driverId, status },
  });

  const onSubmit = async (data: FormSchemaToggle) => {
    try {
      await toggleMemberStatus.trigger(data);
      toast.success("Status updated successfully");
    } catch (err) {
      toast.error("Failed to update status. Please try again.");
    }
  };

  return (
    <Controller
      control={control}
      name="status"
      render={({ field }) => (
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Status</Label>
          <Switch
            checked={field.value}
            onCheckedChange={(checked) => {
              field.onChange(checked);
              handleSubmit(onSubmit)();
            }}
            disabled={toggleMemberStatus.isLoading}
          />
        </div>
      )}
    />
  );
}
