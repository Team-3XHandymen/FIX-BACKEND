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