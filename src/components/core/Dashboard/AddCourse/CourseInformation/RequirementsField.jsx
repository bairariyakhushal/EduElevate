// React hooks for local state and side-effects
import { useEffect, useState } from "react"
// Access global course state from Redux
import { useSelector } from "react-redux"

// Reusable field for adding/removing list of requirements/instructions
export default function RequirementsField({
  name,
  label,
  register,
  setValue,
  errors,
  getValues,
}) {
  // Read edit mode flag and current course from store
  const { editCourse, course } = useSelector((state) => state.course)
  // Controlled input for the current requirement text
  const [requirement, setRequirement] = useState("")
  // Array holding all requirements added by the user
  const [requirementsList, setRequirementsList] = useState([])

  // On mount: preload requirements in edit mode and register the field with RHF
  useEffect(() => {
    if (editCourse) {
      setRequirementsList(course?.instructions)
    }
    register(name, { required: true, validate: (value) => value.length > 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Whenever list changes, sync it back to RHF form state
  useEffect(() => {
    setValue(name, requirementsList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requirementsList])

  // Add the current requirement text into the list
  const handleAddRequirement = () => {
    if (requirement) {
      setRequirementsList([...requirementsList, requirement])
      setRequirement("")
    }
  }

  // Remove requirement by index
  const handleRemoveRequirement = (index) => {
    const updatedRequirements = [...requirementsList]
    updatedRequirements.splice(index, 1)
    setRequirementsList(updatedRequirements)
  }

  return (
    <div className="flex flex-col space-y-2">
      {/* Field label */}
      <label className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>
      <div className="flex flex-col items-start space-y-2">
        {/* Requirement input (controlled) */}
        <input
          type="text"
          id={name}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          style={{
            boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.36)",
          }}
          className="w-full rounded-[0.5rem] bg-richblack-700 p-[12px] text-richblack-5"
        />
        {/* Add button to push current input into list */}
        <button
          type="button"
          onClick={handleAddRequirement}
          className="font-semibold text-yellow-50"
        >
          Add
        </button>
      </div>
      {/* Render list of added requirements with a clear action */}
      {requirementsList.length > 0 && (
        <ul className="mt-2 list-inside list-disc max-h-40 overflow-auto pr-2">
          {requirementsList.map((requirement, index) => (
            <li key={index} className="flex items-center text-richblack-5">
              <span>{requirement}</span>
              <button
                type="button"
                className="ml-2 text-xs text-pure-greys-300 "
                onClick={() => handleRemoveRequirement(index)}
              >
                clear
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* Validation error (at least one requirement is needed) */}
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}
