import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import OTP from "../models/otp.model.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export async function signup(req, res) {
  const { email, password, fullName, gender } = req.body;

  try {
    if (!email || !password || !fullName || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "Email already exists, please use a diffrent one" });
      } else {
        // If unverified, we can resend OTP or just tell them it already exists and is unverified.
        // We'll proceed to resend OTP in this basic flow.
      }
    }

    let user = existingUser;
    if (!existingUser) {
      const randomAvatar = `https://avatar.iran.liara.run/public/${gender}?username=${fullName}`;

      user = await User.create({
        email,
        fullName,
        password,
        profilePic: randomAvatar,
        gender,
        isVerified: false,
      });
    } else {
      // update details if they tried to signup again while unverified
      user.password = password;
      user.fullName = fullName;
      user.gender = gender;
      await user.save();
    }

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // delete old otps for this email
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp: otpCode });

    console.log(`[DEV] OTP code for ${email} is: ${otpCode}`);

    // Send via nodemailer
    try {
      let transporter;
      
      // If user has provided real SMTP credentials, use them
      if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
        transporter = nodemailer.createTransport({
          service: 'gmail', // you can also specify host/port directly
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
          },
        });
      } else {
        // Fallback to test account (only logs URL to console)
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      const info = await transporter.sendMail({
        from: `"Konnect Auth" <${process.env.SMTP_EMAIL || 'auth@konnect.com'}>`,
        to: email,
        subject: "Your Konnect Verification Code",
        text: `Your OTP is ${otpCode}`,
        html: `<b>Your OTP is ${otpCode}</b>`,
      });

      if (!process.env.SMTP_EMAIL) {
         console.log("\n=======================================================");
         console.log("No SMTP credentials found in .env, used Ethereal for testing.");
         console.log("TEST EMAIL PREVIEW URL:", nodemailer.getTestMessageUrl(info));
         console.log("=======================================================\n");
      }
    } catch (emailErr) {
      console.log("Error sending email, continuing anyway (check console for OTP)", emailErr);
    }

    res.status(201).json({ success: true, message: "OTP sent to your email", email });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function verifyOTP(req, res) {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpRecord = await OTP.findOne({ email, otp });
    
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mark as verified
    user.isVerified = true;
    await user.save();

    // Remove OTP so it can't be reused
    await OTP.deleteMany({ email });

    // Stream user setup
    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePic || "",
      });
      console.log(`Stream user created for ${user.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    // Auth JWT setup
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });

  } catch (error) {
    console.log("Error in verifyOTP controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}
