interface StepDescriptionProps {
    title: string;
    description: string;
    number: string;
}

const StepDescription = ({ title, description, number }: StepDescriptionProps) => {
    return (

        <li className="flex items-start gap-4 p-4 max-w-2xl">
            <div className="flex-none w-12 h-12 font-fruncy-sage text-2xl rounded-full flex items-center justify-center bg-burnt-peach text-bright-white">
                {number}
            </div>
            <div className="flex flex-col ">
                    <h4 className="font-semibold">{title}</h4>
                    <p className="text-sm">
                        {description}
                    </p>
            </div>
        </li>
    )
};

export default StepDescription;