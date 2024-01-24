import prismadb from "@/lib/prismadb";
import CompanionForm from "./components/companion-form";
import { auth, RedirectToSignIn, } from "@clerk/nextjs";

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
    return <RedirectToSignIn/>
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
      userId={userId}
    />
  );
};

export default CompanionIdPage;