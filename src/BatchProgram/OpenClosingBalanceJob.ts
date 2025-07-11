import cron from "node-cron";
import { CurrentTime } from "../helper/common";

export const startCronJobs = () => {
  // cron.schedule("0 10 * * *", async () => {
  //   console.log("Running daily batch job at 9:00 AM", CurrentTime());

  //   try {
     
  //     console.log("Daily batch job completed successfully", CurrentTime());
  //   } catch (error) {
  //     console.error("Error in daily batch job:", error, CurrentTime());
  //   }
  // });

  cron.schedule("0 3 1 * *", async () => {
    console.log(
      "Running monthly batch job at 3:00 AM on the 1st",
      CurrentTime()
    );

    try {
      // Your batch logic here
      console.log("Monthly batch job completed successfully", CurrentTime());
    } catch (error) {
      console.error("Error in monthly batch job:", error, CurrentTime());
    }
  });

// cron.schedule("* * * * *", async () => {
//   console.log("Running job every 1 minute", CurrentTime());

//   try {
//     // Your job logic here
//     console.log("1-minute job completed", CurrentTime());
//   } catch (error) {
//     console.error("Error in 1-minute job:", error, CurrentTime());
//   }
// });

  
};
