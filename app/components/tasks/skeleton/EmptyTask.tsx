import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/app/components/ui/empty";
import { Hand } from "lucide-react";

export function EmptyDemo() {
  return (
    <div className="mt-25">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Hand />
          </EmptyMedia>
          <EmptyTitle>Empty</EmptyTitle>
          <EmptyDescription>
            Change tasks statuses by drag/drop your task.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
