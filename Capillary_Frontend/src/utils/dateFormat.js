export const formatDateToDDMMYY = (inputDate)=> {
    const date = new Date(inputDate); // Convert the input to a Date object

    const day = String(date.getDate()).padStart(2, "0"); // Ensure 2 digits
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of year

    return `${day}/${month}/${year}`;
  }


