import prismadb from "@/lib/prismadb";
import CompanionForm from "./components/companion-form";
import { auth, redirectToSignIn } from "@clerk/nextjs";

interface CompanionIdpageProps {
  params: {
    companionId: string;
  };
};

const CompanionIdPage = async ({
  params
}: CompanionIdpageProps) => {
  const {userId} = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  // fetch the companion using companionId from url
  const companion = await prismadb.companion.findUnique({
    where: {
      id: params.companionId,
      userId
    }
  });


  return (
    <CompanionForm 
      initialData={companion}
    />
  );
};

export default CompanionIdPage;