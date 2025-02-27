<div align="center">
<img src="./frontend/public/OpenGig_Logo_Light_Mode.svg" alt="OpenGig Logo" style="height: 30%; width: auto;">

A platform built for gig workers and customers.

[Docs](./docs/index.md) | [OpenGig.org](https://opengig.org)
</div>

---
<br/>

OpenGig.org is an Open Source Service platform built for gig workers and customers. We stand for openness, the rights of customers, and for the empowerment of workers.

# Why work on OpenGig?
Our platform empowers gig workers by removing the greedy middlemen. OpenGig allows you to dictate your own terms by providing tools built for you.

- Set your own rates and earn a fair share.
- Use transparent, open-source pricing algorithms that suggest fair prices based on real data.
- Enjoy at-cost fees; you pay only for what you use—nothing goes to executive golden parachutes or vanity projects.
- Gain insights into market trends through our Open Statistics accessible to everyone.
- Join a community-directed platform focused on development and improvement.

Gig workers benefit from our Open Source principle; OpenGig is entirely open source, providing everyone with equal access to its core. Nothing is hidden, and there's no secret algorithm manipulating your labor.

# Why spend on OpenGig?
OpenGig is adaptable, catering to a wide spectrum of gig services—from ride-sharing and food delivery to freelance tasks. Whatever you need, we've got you covered.

Customers benefit from our Open Cost principle. You pay only for what you consume, with every cent transparently used for your service or payout. The fees your charged go to supporting the platform, not to luxury yachts, failed self-driving taxi ventures, or stock bonuses for capitalist billionaires.

# What are our goals?
- Define a standard for Open Source Services and the policies they should follow, lead by example.
- Provide a self-sustaining worker and customer focused platform.
- Compete with the largest unicorn startups with less; less waste, less environmental impact, less social damage.
- Create a welcoming community of developers, gig workers, and customers.

# Open Source Service Policies
What makes an organization an Open Source Service?

1. **Open Source.** The source code of an **Open Source Service** is, and always will be in perpetuity, a public resource accessible and modifiable to all, using at bare minimum the GNU GPL-3.0 license.

2. **Open Statistics.** The hosting, metrics, costs, and expenses of an **Open Source Service** are all publicly visibile, accessible to all, and up to date. Everyone can view the costs to run the platform, how many users it hosts, and every other imaginable metric implemented. There should be no such hidden metrics visible only to the developers of the platform.

3. **Open Structure.** The orgnaizational structure of an **Open Source Service** is publicly visible and up to date. Functionally a workers coop, with government-like stickyness to change, communal voting and agreement. The community, developers and users, are all apart of the organization, because they all have a vested interest in its operations, contributinos, and success. Not just the founder, not just the developers, or managers.

4. **Open Cost.** An **Open Source Service** operates at-cost. Every expense, from maintaining the platform to paying equitable wages to those who contribute to the project, is openly tracked and reported. Open Cost provides checks and balances, ensuring that the focus remains on serving the community rather than generating excess profits.

OpenGig.org is an Open Source Service.

TODO: More details and guildines for the above points should be laid out.

# Monitary Outline
The cost to run the platform is directly dictated by these factors:

**Hardware.** The pysical hardware needed to host the platform, this can be either in the form of a physical one time purchas (including upgrades, part replacement and repairs), or a recuring rental fee in the case of a service such as DigitalOcean

**Domains.** The cost to rent a top level domain for ease of use and access for users. Typically a small yearly or bi-yearly fee.

**Software Development.** Compensation for the team responsible for coding, maintaining, and improving the platform. This includes frontend and backend developers, UI/UX designers, and quality assurance testers.

**Payment Processing.** Fees associated with transaction processing within the platform, including payments to gig workers and handling consumer payments.

**Outreach and Awareness.** Resources dedicated to spreading awareness and the principles of the OpenGig platform. This includes initiatives for sharing our mission and values through marketing content, community-building activities, and meaningful interactions with gig workers and customers.

**Legal and Compliance.** Costs associated with adhering to local and international laws and regulations. This includes hiring legal advisors and ensuring compliance with data protection regulations like GDPR.

**Customer Support.** Providing assistance to users through a dedicated support team, ensuring seamless interaction and satisfaction on the platform.

# Roadmap

- [x] Secure live landing page: Develop a locked-down and secure landing page to address any concerns with the current setup and ensure db data is protected from non-signed in users. https://github.com/torrinworx/OpenGig.org/issues/3

- [x] Deployment and CI/CD: Automatic building and deployment of the OpenGig.org platform to DigitalOcean. This includes the deployment of a MongoDB server, data storage with DO s3, and networking. https://github.com/torrinworx/OpenGig.org/issues/4

- [ ] Generic user structure: Design a database structure that allows users to be both gig workers and customers, similar to Bumble's dual mode (date vs friend) approach within the same app (worker & customer). https://github.com/torrinworx/OpenGig.org/issues/5

- [ ] Freelance tasks: Enable customers to post freelance tasks workers can apply to, workers to post free lance services customers can search for and request. https://github.com/torrinworx/OpenGig.org/issues/6

- [ ] Community Participation and Voting System: Create a community communication platform for member interaction and updates on platform development (similar to Discord). Incorporate a democratic voting system for platform decisions, aligning with the Open Structure principle.
