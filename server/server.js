const express=require("express");
const app=express();

const userRoutes=require("./routes/user");
const profileRoutes=require("./routes/profile");
const paymentRoutes=require("./routes/payment");
const courseRoutes=require("./routes/course");
const aiRoutes=require("./routes/ai");

const database=require("./config/database");
const cookieParser=require("cookie-parser");
const cors=require("cors");
const {cloudinaryConnect}=require("./config/cloudinary");
const fileUpload=require("express-fileupload");
require("dotenv").config();

const port=process.env.PORT || 5000;

// Connect to MongoDB
database.dbConnect();

// Middleware
app.use(cors({
		origin:["http://localhost:3000",
		"https://eduelevate-ai.vercel.app"],
		credentials:true,
	}));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	}));

// Cloudinary configuration
cloudinaryConnect();

// Routes
app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/payment",paymentRoutes);
app.use("/api/v1/course",courseRoutes);
app.use("/api/v1/ai",aiRoutes);

// Start the server
app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});


app.get("/", (req, res) => {
	res.send("Hello, Jii !");
});