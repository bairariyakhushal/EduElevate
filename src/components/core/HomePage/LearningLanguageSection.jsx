import React from 'react'

import HighlightText from './HighlightText'
import know_your_progress from '../../../assets/Images/Know_your_progress.png'
import compare_with_others from "../../../assets/Images/Compare_with_others.png"
import plan_your_lesson from "../../../assets/Images/Plan_your_lessons.png"
import CTAButton from "../HomePage/Button"


const LearningLanguageSection = () => {
    return (
        <div className='text-4xl font-semibold text-center mt-[130px] mb-20 flex flex-col items-center gap-5'>
            <div className='text-4xl font-semibold text-center '>
                Your Swiss Knife for 
                <HighlightText text={" learning any language"}/>
            </div>

            <div className='text-center text-richblack-700 mx-auto text-base font-medium w-[70%]'>
                Using spin making learning multiple languages easy. with 20+ languages realistic voice-over, progress tracking, custom schedule and more.
            </div>

            <div className='flex flex-row items-center justify-center mt-5'>
                <img 
                    src={know_your_progress}
                    className='object-contain -mr-32'
                />

                <img 
                    src={compare_with_others}
                    className='object-contain'
                />

                <img 
                    src={plan_your_lesson}
                    className='object-contain -ml-36'
                />
            </div>

            <div className='w-fit'>
                <CTAButton active={true} linkto={"/signup"}>
                    Learn More
                </CTAButton>
            </div>
        </div>
    )
}

export default LearningLanguageSection;