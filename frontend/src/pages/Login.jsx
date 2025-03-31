import axios from "axios";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [modalContent, setModalContent] = useState(null);

  const openModal = (content) => {
    setModalContent(content);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = e.target.elements;

    const user = {
      email: email.value,
      password: password.value,
    };

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/login`,
        user
      );
      if (res.status === 200) {
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate("/");
        toast.success("Logged in successfully");
      } else {
        toast.error("User does not exist or password maybe incorrect");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong, please try again!");
    }
  };

  // Placeholder content for modal
  const termsContent = `
Terms and Conditions

1. Acceptance of Terms
By accessing or using discuza.in (the "Website"), you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Website.

2. User Accounts
- Registration: Users must register with a valid email address and create a secure password to access certain features of the Website. By registering, you agree to provide accurate and current information.
- Responsibilities: You are responsible for maintaining the confidentiality of your account and password. You are also responsible for all activities that occur under your account.

3. Use of the Website
- Permitted Use: You may use the Website to participate in discussions, share information, and engage with the community in accordance with these terms. This includes posting content on topics such as technology, health, sustainability, politics, and other categories listed on the Website.
- Prohibited Use: You may not use the Website for any unlawful activities, to post inappropriate, offensive, or misleading content, or to violate the rights of others.

4. Content
- User-Generated Content: Users are responsible for the content they post. discuza.in does not endorse any opinions expressed by users and is not liable for content accuracy.
- Moderation: The Website reserves the right to remove or edit any content that violates these terms, community guidelines, or legal requirements. Content related to sensitive topics, including but not limited to health, politics, and social issues, must adhere to the highest standards of respect and accuracy.

5. Intellectual Property
- Ownership: All intellectual property on the Website, including text, graphics, logos, and software, is owned by discuza.in or its licensors.
- License: By posting content on the Website, users grant discuza.in a non-exclusive, royalty-free license to use, reproduce, and distribute the content in connection with the operation and promotion of the Website.

6. Privacy
Use of the Website is subject to our Privacy Policy, which explains how we collect, use, and protect your personal information.

7. Limitation of Liability
discuzA.in is not liable for any indirect, incidental, or consequential damages arising from the use of the Website. Users participate in discussions and activities at their own discretion and risk.

8. Termination
discuzA.in reserves the right to suspend or terminate accounts or access to the Website for any violations of these Terms and Conditions.

9. Changes to Terms
These Terms and Conditions may be updated from time to time. Continued use of the Website constitutes acceptance of any changes.

10. Governing Law
These Terms and Conditions are governed by the laws of India. Any disputes shall be resolved in the courts located in India.

---
`;

  const privacyContent = `
Privacy Policy

1. Introduction
This Privacy Policy explains how discuza.in (the "Website") collects, uses, and protects your personal information.

2. Information We Collect
- Personal Information: When you register, we collect your name, email address, and any other information you provide.
- Usage Data: We collect data about your interactions with the Website, including IP address, browser type, and pages visited.
- Topic Interactions: Data related to your participation in discussions on topics such as technology, health, and other categories is collected to improve user experience.

3. Use of Information
- To Provide Services: We use your information to facilitate discussions, manage accounts, and deliver notifications.
- To Improve the Website: Usage data helps us optimize performance, user experience, and content recommendations.

4. Sharing of Information
- Third Parties: We do not sell your personal information. However, we may share data with service providers for operational purposes.
- Legal Requirements: We may disclose information to comply with legal obligations or protect our rights.

5. Data Security
We implement encryption and secure storage to protect your data from unauthorized access. Despite these measures, no system is entirely secure, and we cannot guarantee absolute security.

6. Your Rights
You have the right to access, update, or delete your personal information. Contact us at discuzaforum@gmail.com to exercise these rights.

7. Changes to Policy
This Privacy Policy may be updated periodically. Users will be notified of significant changes.

8. Contact Us
For questions regarding this policy, email us at discuzaforum@gmail.com.

---
`;

  const disclaimerContent = `
Disclaimer

- Accuracy of Information: discuza.in does not guarantee the accuracy or completeness of any content posted by users. The Website is not responsible for any decisions made based on this content, especially in sensitive areas such as health, politics, or science.
- Third-Party Links: The Website may contain links to external sites. discuza.in is not responsible for the content or practices of these sites.
- No Professional Advice: Content on discuza.in is for informational purposes only and should not be considered professional advice, especially in topics like health, legal, or financial matters.
- Limitation of Liability: The use of the Website is at your own risk. discuza.in is not liable for any loss or damage arising from your use of the Website.

By using discuza.in, you acknowledge that you have read, understood, and agree to the above Terms and Conditions, Privacy Policy, and Disclaimer.
---
`;
  return (
    <div className="h-screen w-screen flex flex-col justify-between dark:bg-[#32353F]">
      <Toaster />
      <div
        className=" flex flex-col items-center mt-20 pt-6 
    sm:justify-center sm:pt-0 "
      >
        <div className="mt-12 md:mt-0">
          <p className="md:text-4xl font-bold text-purple-450 text-3xl dark:text-white">
            Welcome to Discuza Forum!
          </p>
        </div>
        <div className="mt-12 md:mt-0">
          <a href="/">
            <h3 className="text-4xl font-bold text-purple-950 dark:text-white">
              Login
            </h3>
          </a>
        </div>

        {/* Welcome Message */}
        <div className="w-[90%] md:w-full text-center bg-purple-100 dark:bg-[#1E212A] border px-4 py-4 mt-4 shadow-md sm:max-w-md rounded-lg">
          <p className="text-purple-950 dark:text-white text-sm md:text-base">
            Engage in meaningful discussions, share knowledge, and collaborate
            with the community. To use the forum, make sure you have a valid
            email address and a secure password to register or log in.
          </p>
        </div>

        <div
          className="w-[90%] md:w-full bg-purple-300
      dark:bg-[#1E212A] border
      px-6 py-4 mt-6 overflow-hidden
      shadow-md sm:max-w-md rounded-lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="mt-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium 
              text-purple-950 dark:text-white"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                className="border border-purple-200 mt-2 w-full h-10 px-3 rounded 
                  outline-none 
                  shadow-sm"
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="password"
                className="block text-sm 
              font-medium text-purple-950 dark:text-white"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                className="border border-purple-200 mt-2 w-full h-10 px-3 rounded 
                  outline-none 
                  shadow-sm"
              />
            </div>

            <div className="mt-8 flex flex-col items-center justify-center ">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-xs font-semibold 
              tracking-widest 
              text-white uppercase transition duration-150 ease-in-out 
              bg-purple-950 border border-transparent rounded-md 
              active:bg-gray-900 false"
              >
                Login
              </button>
              <a className="text-sm text-black-500 underline" href="/register">
                Don't have an account? Register
              </a>
              <a
                className="text-sm text-black-500 underline mt-2"
                href="/forgot-password"
              >
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </div>
      {/* Footer Section */}
      <footer className="text-center lg:text-center text-gray-300 text-sm lg:text-base">
        <ul className="flex justify-center space-x-6 text-purple-950">
          <li>
            <button
              onClick={() => openModal(termsContent)}
              className="hover:text-purple-500"
            >
              Terms & Conditions
            </button>
          </li>
          <li>|</li>
          <li>
            <button
              onClick={() => openModal(privacyContent)}
              className="hover:text-purple-500"
            >
              Privacy Policy
            </button>
          </li>
          <li>|</li>
          <li>
            <button
              onClick={() => openModal(disclaimerContent)}
              className="hover:text-purple-500"
            >
              Disclaimer
            </button>
          </li>
        </ul>
        <p className="mt-4 text-purple-950 text-center">
          &copy; 2024 Discuza Forum. All rights reserved.
        </p>
      </footer>

      {/* Modal for displaying content */}
      {modalContent && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}
        >
          <div
            className="bg-white text-black p-4 rounded shadow-lg w-full h-full max-w-full max-h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="whitespace-pre-wrap text-black text-base font-bold">
              {modalContent}
            </p>
            <button
              onClick={closeModal}
              className="mt-4 text-orange-500 hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
