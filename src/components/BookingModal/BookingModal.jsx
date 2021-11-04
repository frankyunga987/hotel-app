import { React, useState, useEffect, useCallback } from 'react'
import { Button, Modal, Form } from 'react-bootstrap'


import DatePicker from 'react-datepicker';
import { addDays, eachDayOfInterval, format, parseISO } from 'date-fns';


import './BookingModal.css'
import 'react-datepicker/dist/react-datepicker.css';

import { apiPostBookingData } from '../../api/api';
import Total from './Total';



export default function BookingModal(props) {
  const [roomData, setRoomData] = useState(props.data)
  const [roomID, setRoomID] = useState(props.roomID)
  const [booking, setBooking] = useState(props.booking)
  const [validated, setValidated] = useState(false);

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [guestName, setGuestName] = useState()
  const [guestTel, setGuestTel] = useState()
  const [selectDate, setSelectDate] = useState()

  const [formData, setFormData] = useState({
    name: '',
    tel: '',
    date: [],
  })

  useEffect(() => {
    setRoomData(props.data)
    setRoomID(props.roomID)
    setBooking(props.booking)
    console.log(booking)
    console.log(props)
    console.log(startDate)
    console.log(endDate)

    if (endDate <= startDate) {
      setEndDate(addDays(startDate, 1));
    }

  }, [props, startDate, endDate, booking])

  const setName = e => {
    setGuestName(e.target.value)
  }

  const setTel = e => {
    setGuestTel(e.target.value)
  }



  useEffect(() => {
    if (endDate > startDate) {
      const gettingFormDate = eachDayOfInterval({
        start: startDate,
        end: endDate,
      })
        .map(date => format(new Date(date), 'yyyy-MM-dd'));

      setSelectDate(gettingFormDate)
    }

  }, [endDate, startDate])


  useEffect(() => {

    setFormData({
      name: guestName,
      tel: guestTel,
      date: selectDate,
    })

    console.log(formData)

  }, [guestName, guestTel, selectDate])

  const sendFormData = useCallback(
    (roomID, formData) => {
      const sendingFormData = async (roomID, formData) => {
        // createFormData()

        try {

          await apiPostBookingData(roomID, formData);
          console.log('success');

          alert('訂房成功')

        } catch (e) {

          console.error(`🚫 Something went wrong posting data: ${e.response.data.message}`);

          alert(e.response.data.message)
        }
      }
      sendingFormData(roomID, formData)

    }, [])

  const handleSubmit = (event) => {

    console.log(formData)
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);
    sendFormData(roomID, formData);

    // setFormData({
    //   name: '',
    //   tel: '',
    //   date: [],
    // })

  };

  useEffect(() => {
    if (props.show === false) {
      setFormData({
        name: '',
        tel: '',
        date: [],
      })
    }
  }, [props])

  const highlightWithRanges = [
    {
      "react-datepicker__day--highlighted-custom-1": [
        new Date(),
      ],
    },
    {
      "react-datepicker__day--highlighted-custom-2":
        booking.map(data => parseISO(data.date)),
    },
  ];


  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Reservation Information
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <div className='form-price'>
            <div className='form-normal-price'>
              <span>Mon-Thu per night</span>
              <span style={{ textAlign: 'center' }}>NT{roomData.normalDayPrice}</span>
            </div>
            <div className='form-holiday-price'>
              <span>Fri-Sun per night</span>
              <span style={{ textAlign: 'center' }}>NT{roomData.holidayPrice}</span>
            </div>
          </div>
          <br />
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              required
              onChange={setName}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a name.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter phone number"
              required
              onChange={setTel}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a phone number.
            </Form.Control.Feedback>
          </Form.Group>

          <div style={{ marginBottom: '8px' }}>
            Date
          </div>
          <div className='date-picker'>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              minDate={addDays(new Date(), 1)}
              excludeDates={booking.map(data => parseISO(data.date))}
              placeholderText="Check in"
              highlightDates={highlightWithRanges}
            >
              <div style={{ color: "red" }}>紅色日期已被訂房!</div>
              <div style={{ color: "darkorange" }}>不能選擇當日進行訂房!</div>
            </DatePicker>
            <span className='datapicker-line'>~</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={addDays(new Date(), 2)}
              excludeDates={booking.map(data => parseISO(data.date))}
              placeholderText="Check Out"
              highlightDates={highlightWithRanges}

            >
              <div style={{ color: "red" }}>紅色日期已被訂房!</div>
              <div style={{ color: "darkorange" }}>不能選擇當日進行訂房!</div>
            </DatePicker>
          </div>
          <Total
            normalDayPrice={roomData.normalDayPrice}
            holidayPrice={roomData.holidayPrice}
            startDate={startDate}
            endDate={endDate}
          />
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
        <Button type="submit" onClick={handleSubmit}>Submit form</Button>
      </Modal.Footer>
    </Modal>
  );
}