Created on 14/08/25 to keep track of different commits

Use this template
____________________________________________________________________________________________________
Collaborator name:
Date: 
Commit msg: 
Changes made: 
    *
    *
    *
Notes:
________________________________________________________________________________________________
Collaborator name:Sewwandi
Date: 14/8/25
Commit msg: COMMIT.md created
Changes made: 
    *COMMIT.md created
    *
    *
Notes:

Collaborator name:Sewwandi
Date: 15/8/25
Commit msg:Client sign up Integration with database 1
Changes made: 
    *Changed the sign up interface of clerk to enter a username and address the user by the new username.
    *Integrated clerk sign up to trigger creating a new user in the database collection-clients with minimal data; username,email,clerkuserid, created time.
    *Here is the flow: 
    User Signs Up (Index.tsx)
├── Attempts to create client record once
├── If new user → Client created successfully
├── If existing user → Silently handles 409 conflict
└── User marked as processed (no infinite loops)

User Navigates to Dashboard (ClientDashboard.tsx)
├── Fetches client data from database
├── Displays clean, professional interface
└── No debug information cluttering the UI
Notes:getting errors for inline codes.
________________________________________________________________________________________________
Collaborator name:Sewwandi
Date: 15/8/25
Commit msg: "Complete Your Profile setup"
Changes made: 
    *Added a complete your profile segment
    *Added logic to show the profile completion progress
    *Profile page was modified to show available info and enabled editing customer data.
Notes: Need to integrate google maps to add the address precisely.
________________________________________________________________________________________________
Collaborator name:Sewwandi
Date: 17/8/25
Commit msg: "Booking placement integrated for clients"
Changes made: 
    *Added Hire now buttons to service provider cards
    *Created an advanced form to place bookings and integrated the database to save the booking with providerID, clientID, and other filled information with status set as pending
    *Generating a booking ID at the end of every booking placement
Notes: Inline code errors.
________________________________________________________________________________________________
Collaborator name:Sewwandi
Date: 18/8/25
Commit msg: "Upcoming bookings integrated with the db:clients"
Changes made: 
    *Integrated Your bookings component with the database collection bookings.(Shows all bookings under clientid except for completed ones)
    *Instead of using two booking ids , removed the auto generating bookingid and kept only the database bookingid
    *Changed the collection bookings to save the serviceprovider's name and service category name too to render details easier.
Notes: 
________________________________________________________________________________________________
Collaborator name:Sewwandi
Date: 19/8/25
Commit msg: "Handyman registration integration with the database"
Changes made: 
    *Modified the handyman registration form for user convinience
    *Integrated the database to store the registration details and create a serviceprovider array.
    *Added the service dashboard button to the homepage for easy access, it checks the clerk unsafemetadata to identify the user as a handyman and make this button visible only to the serviceproviders.
    *Deleted few service arrays that didnt make sense.
Notes: Can start with handyman part of booking process.