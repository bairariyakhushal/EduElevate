export const formattedDate = (date) => {
  if (!date) {
    return ""
  }

  try {
    // Create a new Date object
    const dateObj = new Date(date)
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return ""
    }

    // Format date in a readable format
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return ""
  }
}
