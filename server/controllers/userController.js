import Course from "../models/Course.js"
import { Purchase } from "../models/Purchase.js"
import User from "../models/User.js"
import { getAuth } from '@clerk/express'
import Stripe from 'stripe'

// GEt User Data
export const getUserData = async(req,res)=>{
     try{
        //  const userId = req.auth.userId
        //  const user = await User.findById(userId)

        const { userId } = getAuth(req)
        const user = await User.findOne({ _id: userId })
        // const user= await User.findById(userId)

         if(!user){
            return res.json({ success:false, message: 'User Not Found'})
         }

         res.json({success:true, user})
     } catch(error){
        res.json({ success: false, message: error.message})
     }
}

// Users Enrolled Courses with Lecture Links
export const userEnrolledCourses = async(req,res)=>{
    try{
        // const userId = req.auth.userId
        const {userId} = getAuth(req)
        const userData = await User.findOne({_id: userId}).populate('enrolledCourses')
        // const userData = await User.findById(userId).populate('enrolledCourses')

        res.json({ success:true, enrolledCourses: userData.enrolledCourses})
    } catch(error){
        res.json({success: false, message:error.message})
    }
}

  // Purchase Course

export const purchaseCourse = async(req,res)=>{
    try{
       const { courseId} = req.body
       const { origin} = req.headers
       const {userId} = getAuth(req)
       const userData = await User.findOne({_id: userId})
    // const userData = await User.findById(userId)
    const courseData= await Course.findById(courseId)

    console.log("PURCHASE COURSE FUNCTION HIT");
    console.log("userId:", userId);
    console.log("userData found:", !!userData);
    console.log("courseData found:", !!courseData);

       if (!userData) {
      return res.status(404).json({
       success: false,
        message: "User Not Found"
       });
        }

       if (!courseData) {
        return res.status(404).json({
         success: false,
       message: "Course Not Found"
        });
         }

    // if(!userData || courseData){
    //     return res.json({ success: false, message: 'Data Not Found'})
    // }

    const purchaseData = {
        courseId: courseData._id,
        userId,
        amount:(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)
    }

    const newPurchase = await Purchase.create(purchaseData)

    // Stripe Gateway initialize
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

    const currency = process.env.CURRENCY.toLowerCase()

    // Creating line items to for Stripe 
    const line_items = [{
        price_data:{
            currency,
            product_data:{
                name: courseData.courseTitle
            },
            unit_amount: Math.floor(newPurchase.amount) * 100
        },
        quantity:1
    }]

    const session = await stripeInstance.checkout.sessions.create({
        success_url: `${origin}/loading/my-enrollments`,
        cancel_url:`${origin}`,
        line_items: line_items,
        mode:'payment',
        metadata: {
            purchaseId: newPurchase._id.toString()
        }
    })
     
    res.json({success: true, session_url: session.url})

    } catch(error){
      res.json({success: false, message: error.message})
    }
}