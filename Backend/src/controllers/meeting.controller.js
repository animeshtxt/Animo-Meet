import { Meeting } from "../models/meeting.model.js";
import { status } from "http-status";

const checkMeetCode = async (req, res) => {
  try {
    const { meetingCode } = req.params;
    const existingMeeting = await Meeting.findOne({ meetingCode });
    if (existingMeeting) {
      return res.status(status.FOUND).json({
        message:
          "A meeting with this code already exists. Try generating new code",
      });
    }
    const newMeeting = new Meeting({
      hostUsername: req.user.username,
      meetingCode: meetingCode,
    });

    const savedMeeting = await newMeeting.save();
    return res.status(status.OK).json({
      message: `new meeting created successfully, code: ${meetingCode}`,
    });
  } catch (e) {
    console.log(e);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: `Internal server error : ${e}` });
  }
};

const doesMeetExist = async (req, res) => {
  try {
    const { meetingCode } = req.params;
    console.log("checking code : ", meetingCode);
    const existingMeeting = await Meeting.findOne({ meetingCode });
    if (existingMeeting) {
      return res.status(status.OK).json({
        message: "Meeting found",
      });
    } else {
      return res
        .status(status.NOT_FOUND)
        .json({ message: "No such meeting found" });
    }
  } catch (e) {
    console.log(e);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: `Internal server error : ${e}` });
  }
};

const checkIfHost = async (req, res) => {
  try {
    const { username, meetingCode } = req.query;
    const meeting = await Meeting.findOne({ meetingCode });
    if (meeting && meeting.hostUsername === username) {
      return res
        .status(status.OK)
        .json({ message: `${username} is host of this meeting` });
    } else {
      return res
        .status(status.FORBIDDEN)
        .json({ message: `${username} is not the host of this meeting` });
    }
  } catch (e) {
    res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: `Some internal server error occured : ${e}` });
  }
};

export { checkMeetCode, doesMeetExist, checkIfHost };
