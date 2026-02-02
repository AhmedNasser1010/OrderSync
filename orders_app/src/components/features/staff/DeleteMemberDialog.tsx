import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useStaff from "@/hooks/useStaff";
import { type Driver } from "@/types/driver";
import { toast } from "sonner";

export function DeleteMemberDialog({
  children,
  member,
}: {
  children: React.ReactNode;
  member: Driver;
}) {
  const { deleteMember } = useStaff();

  const onDelete = async (uid: string) => {
    try {
      await deleteMember.trigger(uid);
      toast.success("Member deleted successfully");
    } catch (err) {
      toast.error("Failed to delete member. Please try again.");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {member.userInfo.name}? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDelete(member.uid)}
            disabled={deleteMember.isLoading}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
