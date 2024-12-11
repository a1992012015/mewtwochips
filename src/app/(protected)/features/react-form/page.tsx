import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscriminatedUnionForm } from "@/components/react-form/discriminated-union-form";

export default function Page() {
  return (
    <Tabs defaultValue="discriminated" className="">
      <TabsList>
        <TabsTrigger value="discriminated">Discriminated union</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>

      <TabsContent value="discriminated">
        <DiscriminatedUnionForm />
      </TabsContent>

      <TabsContent value="password">Change your password here.</TabsContent>
    </Tabs>
  );
}
