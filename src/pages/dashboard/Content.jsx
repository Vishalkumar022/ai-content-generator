import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FormSection from "../../components/dashboard/FormSection";
import OutputSection from "../../components/dashboard/OutputSection";
import { TemplateLists } from "../../constant/data";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { chatSession } from "../../hooks/AiModal";
import { useMutation } from "@tanstack/react-query";
import { setTotalWordUsage ,setAiResponses} from "../../slices/userSlice";
import { saveGeneratedContent } from "../../apis/apiServices";

const Content = (props) => {
  const { slugName } = useParams();
  const navigation = useNavigate();
  const dispatch = useDispatch();
  const [aiOutput, setAiOutput] = useState("");
  const { totalWordUsage, isAuthenticated, token, userInfo } = useSelector(
    (state) => state.user
  );

  const selectedTemplate = TemplateLists?.find(
    (item) => item?.slug === slugName
  );

  useEffect(() => {
    // Extract valid slugs from TemplateLists
    const validSlugs = TemplateLists.map(template => template.slug);

    // Check if slug exists
    if (!validSlugs.includes(slugName)) {
      navigation("*", { replace: true });
    }
  }, [slugName, navigation]);

  const extractPlainText = (responseText) => {
    // Remove code block markers (```) and any ```rtf sections
    return responseText
      .replace(/```[\w]*\n/g, "") // Remove markdown-style code block headers (e.g., ```cpp, ```rtf)
      .replace(/```/g, "") // Remove remaining triple backticks
      .replace(/{\\rtf1[\s\S]*}/g, "") // Remove RTF formatting completely
      .trim();
  };
  const generateContent = async (formData) => {
    const selectPrompt = selectedTemplate?.aiPrompt;
    const FinalAIPrompt = JSON.stringify(formData) + "," + selectPrompt;
    const result = await chatSession.sendMessage(FinalAIPrompt);

    // Make sure the response exists
    if (!result || !result.response) {
      throw new Error("Failed to get response from chatSession.");
    }

    let output = result.response.text();
    output = extractPlainText(output);

    const data = {
      aiResponse: output,
      templateSlugName: selectedTemplate?.slug,
      formData: formData,
      userId: userInfo?._id,
    };

    // Call the API to save generated content
    return await saveGeneratedContent(data, token);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: generateContent,
    onSuccess: (data) => {
      setAiOutput(data?.data?.aiResponse);
      const totalWords = data?.data?.aiResponse?.split(/\s+/).length;
      const newTotalUsage = Number(totalWordUsage) + totalWords;

      // Dispatch to update total word usage
      dispatch(setAiResponses(data?.data));
      dispatch(setTotalWordUsage(newTotalUsage));
    },
    onError: (error) => {
      toast.error("An error occurred. Please try again.");
      console.error("Error generating content:", error.message);
    },
  });

  // Handler for generating AI content
  const GenerateAIContent = (formData) => {
    if (totalWordUsage >= 10000 && !userInfo.active) {
      toast("Now you need to upgrade your plan to use this feature", {
        icon: "⚠️",
        style: {
          border: "1px solid #FFCC00",
          padding: "16px",
          color: "#FFCC00",
        },
      });
      navigation("/dashboard/billing");
      return;
    }

    mutate(formData);
  };

  return (
    <div className="p-10 bg-whiten dark:bg-boxdark-2 h-[100%] min-h-screen">
      <Link to={"/dashboard"}>
        <button className="flex gap-1 border rounded-lg text-white bg-[#7E5FF9] py-2 px-4">
          <ArrowLeft />
          Back
        </button>
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 md:gap-x-5 py-5">
        {/* FormSection */}
        <FormSection
          selectedTemplate={selectedTemplate}
          isPending={isPending}
          userFormInput={(value) => GenerateAIContent(value)}
        />
        {/* OutputSection */}
        <div className="col-span-2">
          <OutputSection aiOutput={aiOutput} setAiOutput={setAiOutput} />
        </div>
      </div>
    </div>
  );
};

export default Content;
