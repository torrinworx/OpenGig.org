# Jobs
Jobs are pieces of code that are executed, with data from OServer, but requested from the client over a separate websocket.

The goal with a job is to allow the user to request it to be ran, or it to be ran internally on a server. Jobs must be enabled to
allow users to request them from clients.

# Validator
Validators validate data stored in OServer. These essentially will translate into schemas that are stored in mongodb, they will contain
validating data for the observer structure and the observer values themselves.

it would be cool to see a system where you could store all state commits, and be able to slide back and forth between them like a google
maps streetview date slider, but instead of google street view images it would be the users state.

