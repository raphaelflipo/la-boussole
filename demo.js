'use strict';
(() => {
  const english = document.documentElement.lang === 'en';
  const tr = (fr, en) => english ? en : fr;
  const definitions = {
    alpha: {name:'Les Sentiers',type:tr('Groupe scout fictif', "Fictional scout group"),description:tr('Une sortie nature, des départs faciles à retrouver.', "An outdoor day with clear pickup arrangements."),plan:'Association',limits:{members:150,groups:5,events:100,rides:300,admins:1},members:12,groups:2,events:[{id:'nature',title:tr('Journée au grand air', "Outdoor activity day"),when:tr('Samedi · 09:00', "Saturday · 09:00"),where:tr('Parc des Tilleuls (fictif)', "Linden Park (fictional)")},{id:'atelier',title:tr('Préparer le camp ensemble', "Plan the camp together"),when:tr('Dimanche · 14:00', "Sunday · 14:00"),where:tr('Maison des associations (fictif)', "Community centre (fictional)")}],rides:[{id:'a1',event:'nature',driver:'Camille',origin:tr('Place du village (fictif)', "Village square (fictional)"),capacity:3,reserved:1},{id:'a2',event:'nature',driver:'Alex',origin:tr('Parking du stade (fictif)', "Stadium car park (fictional)"),capacity:2,reserved:1},{id:'a3',event:'atelier',driver:'Sam',origin:tr('Maison des associations (fictif)', "Community centre (fictional)"),capacity:2,reserved:0}]},
    beta: {name:'Élan Sport',type:tr('Club sportif fictif', "Fictional sports club"),description:tr('Le prochain match se prépare aussi sur le trajet.', "Plan the ride to the next match."),plan:tr('Organisation', "Organisation"),limits:{members:500,groups:20,events:500,rides:1000,admins:5},members:26,groups:4,events:[{id:'match',title:tr('Rencontre des équipes', "Teams meet-up"),when:tr('Samedi · 13:30', "Saturday · 13:30"),where:tr('Gymnase des Cerisiers (fictif)', "Cherry Tree Gym (fictional)")},{id:'entrainement',title:tr('Entraînement collectif', "Team training"),when:tr('Mercredi · 17:00', "Wednesday · 17:00"),where:tr('Stade du Parc (fictif)', "Park Stadium (fictional)")}],rides:[{id:'b1',event:'match',driver:'Lou',origin:tr('Parking du stade (fictif)', "Stadium car park (fictional)"),capacity:3,reserved:1},{id:'b2',event:'match',driver:'Noa',origin:tr('Place du village (fictif)', "Village square (fictional)"),capacity:3,reserved:3},{id:'b3',event:'entrainement',driver:'Charlie',origin:tr('Parking du stade (fictif)', "Stadium car park (fictional)"),capacity:2,reserved:1}]},
    gamma: {name:'L’Atelier',type:tr('Association locale fictive', "Fictional local association"),description:tr('Une petite équipe, un projet qui rassemble.', "A small group working on a shared project."),plan:tr('Découverte', "Starter"),limits:{members:30,groups:1,events:5,rides:20,admins:1},members:8,groups:1,events:[{id:'visite',title:tr('Visite du jardin partagé', "Community garden visit"),when:tr('Dimanche · 10:00', "Sunday · 10:00"),where:tr('Jardin des Hirondelles (fictif)', "Swallow Garden (fictional)")}],rides:[{id:'c1',event:'visite',driver:'Sacha',origin:tr('Maison des associations (fictif)', "Community centre (fictional)"),capacity:2,reserved:1},{id:'c2',event:'visite',driver:'Maël',origin:tr('Place du village (fictif)', "Village square (fictional)"),capacity:3,reserved:3}]}
  };

  const personas = {
    member: { name: 'Nina', guide: tr('Réservez une place puis annulez-la.', 'Book a seat and then cancel it.'), offer: true },
    parent: { name: 'Morgan', guide: tr('Choisissez le nombre de places de votre foyer fictif. Une demande familiale reste entière.', 'Choose the number of seats for your fictional household. All seats are handled as one request.') },
    driver: { name: 'Avery', guide: tr('Proposez un aller ou un retour et vérifiez les places disponibles.', 'Offer an outbound or return ride and check seat availability.'), offer: true },
    passenger: { name: 'Taylor', guide: tr('Trouvez un trajet ou rejoignez la liste d’attente si le véhicule est complet.', 'Find a ride or join the waitlist if it is full.') },
    leader: { name: 'Eden', guide: tr('Créez un sous-groupe et préparez une consigne de départ.', 'Create a subgroup and prepare a departure instruction.'), schedule: true, groups: true },
    owner: { name: 'Robin', guide: tr('Ajoutez une activité, fixez le rendez-vous et gérez les invitations fictives.', 'Add an event, set the departure point and manage fictional invitations.'), schedule: true, groups: true, members: true, offer: true },
    admin: { name: 'Ari', guide: tr('Testez l’approbation des membres et le suivi des limites de l’espace.', 'Test membership approvals and review group limits.'), groups: true, members: true }
  };

  const departurePoints = {
    village: tr('Place du village (fictif)', 'Village square (fictional)'),
    stadium: tr('Parking du stade (fictif)', 'Stadium car park (fictional)'),
    community: tr('Maison des associations (fictif)', 'Community centre (fictional)')
  };

  const presets = {
    confirm: tr('Je confirme ma présence au départ.', 'I confirm I will be at the departure point.'),
    delay: tr('Je signale un retard de 10 minutes.', 'I will be 10 minutes late.'),
    ask: tr('Puis-je confirmer mon point de rendez-vous ?', 'Can I confirm my pickup point?')
  };

  const el = id => document.getElementById(id);
  const current = () => state[selected];
  const actor = () => personas[role];
  const activeEvent = () => current().events.find(event => event.id === eventId);
  const message = text => { el('demo-status').textContent = text; };
  const seatCount = count => count + tr(' place', ' seat') + (count === 1 ? '' : 's');
  const more = (control, enabled) => { el(control).disabled = !enabled; };

  function freshState() {
    const copy = structuredClone(definitions);
    for (const org of Object.values(copy)) {
      Object.assign(org, {
        bookings: [],
        waiting: [],
        notifications: [],
        activityMessages: [],
        subgroups: [],
        invited: false,
        approved: false,
        feedback: 0
      });
    }
    return copy;
  }

  let state = freshState();
  let selected = 'alpha';
  let role = 'member';
  let eventId = '';
  let serial = 0;

  function notify(text) {
    current().notifications.unshift(text);
    current().notifications = current().notifications.slice(0, 20);
  }

  function button(label, handler) {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'btn small';
    node.textContent = label;
    node.addEventListener('click', handler);
    return node;
  }

  function badge(label, gold = false) {
    const node = document.createElement('span');
    node.className = gold ? 'pill gold' : 'pill';
    node.textContent = label;
    return node;
  }

  function renderList(id, values, empty) {
    const list = el(id);
    const items = values.length ? values : [empty];
    if (items.length === list.children.length && items.every((text, index) => list.children[index].textContent === text)) return;
    list.replaceChildren(...items.map(text => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
  }

  function confirm(ride, reservation, fromQueue = false) {
    ride.reserved += reservation.seats;
    current().bookings.push(reservation);
    const source = fromQueue ? tr('Liste d’attente', 'Waitlist') : tr('Réservation', 'Booking');
    notify(`${source} · ${personas[reservation.role].name} · ${ride.driver} · ${seatCount(reservation.seats)}`);
  }

  function fillWaitingPlaces(ride) {
    const org = current();
    while (true) {
      const next = org.waiting.find(item => item.rideId === ride.id);
      if (!next || next.seats > ride.capacity - ride.reserved) return;
      org.waiting = org.waiting.filter(item => item !== next);
      confirm(ride, next, true);
    }
  }

  function release(ride) {
    const bookings = current().bookings.filter(item => item.rideId === ride.id);
    const localSeats = bookings.reduce((sum, item) => sum + item.seats, 0);
    if (ride.reserved <= localSeats) {
      message(tr('Toutes les places occupées relèvent de réservations de la démo. Annulez-en une avec le rôle qui l’a faite.', 'All occupied seats come from demo bookings. Cancel one using the role that booked it.'));
      return;
    }
    ride.reserved -= 1;
    fillWaitingPlaces(ride);
    render();
    message(tr('Une place fictive a été libérée. La première demande est confirmée dès que son nombre de places est disponible.', 'One fictional seat is now free. The first request is confirmed when all its seats are available.'));
  }

  function reserve(ride, seats) {
    const org = current();
    const alreadyRequested = [...org.bookings, ...org.waiting].some(item => item.rideId === ride.id && item.role === role);
    if (alreadyRequested || ride.offeredBy === role) return;
    const reservation = { rideId: ride.id, role, seats };
    if (seats > ride.capacity - ride.reserved || org.waiting.some(item => item.rideId === ride.id)) {
      if (seats > ride.capacity) return;
      org.waiting.push(reservation);
      notify(tr('Demande en attente', 'Waitlist request') + ` · ${actor().name} · ${ride.driver} · ${seatCount(seats)}`);
      render();
      message(tr('Demande fictive en attente. Simulez un désistement pour libérer une place.', 'Your fictional request is waitlisted. Simulate a cancellation to free a seat.'));
      return;
    }
    confirm(ride, reservation);
    render();
    message(tr('Réservation fictive confirmée. Vous pouvez l’annuler ou changer de rôle.', 'Fictional booking confirmed. You can cancel it or switch roles.'));
  }

  function cancel(ride, reservation) {
    const org = current();
    if (!org.bookings.includes(reservation)) return;
    org.bookings = org.bookings.filter(item => item !== reservation);
    ride.reserved -= reservation.seats;
    notify(tr('Réservation annulée', 'Booking cancelled') + ` · ${actor().name} · ${ride.driver} · ${seatCount(reservation.seats)}`);
    fillWaitingPlaces(ride);
    render();
    message(tr('Réservation fictive annulée. Les places sont à nouveau disponibles ou réattribuées à la liste d’attente.', 'Fictional booking cancelled. Its seats are available again or reassigned to the waitlist.'));
  }

  function removeRide(ride) {
    const org = current();
    if (ride.offeredBy !== role) return;
    org.rides = org.rides.filter(item => item !== ride);
    org.bookings = org.bookings.filter(item => item.rideId !== ride.id);
    org.waiting = org.waiting.filter(item => item.rideId !== ride.id);
    notify(tr('Trajet retiré, réservations et demandes annulées', 'Ride removed, bookings and requests cancelled') + ' · ' + ride.driver);
    render();
    message(tr('Votre trajet fictif a été retiré.', 'Your fictional ride was removed.'));
  }

  function renderRide(ride, event) {
    const org = current();
    const card = document.createElement('article');
    card.className = 'ride-card';
    card.dataset.rideId = ride.id;
    const row = document.createElement('div');
    row.className = 'flex';
    const content = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = ride.driver + ' · ' + ride.origin;
    const info = document.createElement('p');
    const available = ride.capacity - ride.reserved;
    const returning = ride.direction === 'return';
    const direction = returning ? tr('Retour', 'Return') : tr('Aller', 'Outbound');
    const destination = returning ? (ride.destination ?? departurePoints.village) : event.where;
    info.textContent = `${direction} · ${tr('Arrivée', 'Destination')} : ${destination} · ${seatCount(available)} ${tr('sur', 'out of')} ${ride.capacity}`;
    content.append(title, info);

    const actions = document.createElement('div');
    actions.className = 'ride-actions';
    const booked = org.bookings.find(item => item.rideId === ride.id && item.role === role);
    const queued = org.waiting.filter(item => item.rideId === ride.id);
    const waitingIndex = queued.findIndex(item => item.role === role);
    const seats = role === 'parent' ? Number(el('family-seats').value) : 1;

    if (booked) {
      actions.append(badge(tr('Réservé', 'Booked') + ' · ' + seatCount(booked.seats)));
      const label = booked.seats === 1 ? tr('Annuler ma place', 'Cancel my seat') : tr('Annuler les places du foyer', 'Cancel household seats');
      actions.append(button(label, () => cancel(ride, booked)));
    } else if (ride.offeredBy === role) {
      actions.append(badge(tr('Votre trajet fictif', 'Your fictional ride')));
      actions.append(button(tr('Retirer ce trajet', 'Remove this ride'), () => removeRide(ride)));
    } else if (waitingIndex >= 0) {
      actions.append(badge(tr('En attente', 'Waitlisted') + ` · ${waitingIndex + 1} · ${seatCount(queued[waitingIndex].seats)}`, true));
      actions.append(button(tr('Quitter la liste d’attente', 'Leave the waitlist'), () => {
        org.waiting = org.waiting.filter(item => item !== queued[waitingIndex]);
        fillWaitingPlaces(ride);
        render();
        message(tr('Demande fictive retirée de la liste d’attente.', 'The fictional request was removed from the waitlist.'));
      }));
      const occupied = org.bookings.filter(item => item.rideId === ride.id).reduce((sum, item) => sum + item.seats, 0);
      if (ride.reserved > occupied) {
        actions.append(button(tr('Simuler un désistement', 'Simulate a cancellation'), () => release(ride)));
      }
    } else if (seats > ride.capacity) {
      actions.append(badge(tr('Véhicule trop petit pour ce foyer', 'Vehicle too small for this household'), true));
    } else if (seats > available || queued.length) {
      actions.append(button(tr('Rejoindre la liste d’attente', 'Join the waitlist'), () => reserve(ride, seats)));
    } else {
      const label = seats === 1 ? tr('Réserver une place', 'Book a seat') : tr('Réserver les places du foyer', 'Book household seats');
      actions.append(button(label, () => reserve(ride, seats)));
    }
    row.append(content, actions);
    card.append(row);
    return card;
  }

  function render() {
    const org = current();
    if (!activeEvent()) eventId = org.events[0].id;
    const event = activeEvent();
    el('role-guide').textContent = actor().guide;
    el('family-controls').hidden = role !== 'parent';
    el('org-name').textContent = org.name;
    el('org-type').textContent = org.type;
    el('org-description').textContent = org.description;
    el('plan-name').textContent = tr('Offre ', 'Plan · ') + org.plan;
    el('members-count').textContent = org.members;
    el('available-count').textContent = org.rides.reduce((sum, ride) => sum + ride.capacity - ride.reserved, 0);
    el('booking-count').textContent = org.bookings.filter(item => item.role === role).length;

    const events = el('event-select');
    events.replaceChildren(...org.events.map(item => new Option(item.title, item.id)));
    events.value = eventId;
    el('event-details').textContent = event.when + ' · ' + event.where;
    el('event-departure').textContent = event.departure
      ? tr('Consigne publiée', 'Published instruction') + ` · ${event.departure}`
      : tr('Aucune consigne de départ publiée pour cette activité.', 'No departure instruction has been published for this event.');
    const rides = el('rides');
    const focusedRide = document.activeElement?.closest('[data-ride-id]')?.dataset.rideId;
    const cards = org.rides.filter(item => item.event === eventId).map(ride => renderRide(ride, event));
    rides.replaceChildren(...cards);
    if (!cards.length) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = tr('Aucun trajet pour cette activité fictive.', 'There are no rides for this fictional event.');
      rides.append(empty);
    }
    if (focusedRide) {
      const nextControl = cards.find(card => card.dataset.rideId === focusedRide)?.querySelector('button') ?? events;
      nextControl.focus({ preventScroll: true });
    }

    el('admin-hint').textContent = tr('Les boutons accessibles dépendent du rôle sélectionné.', 'Available actions depend on the selected role.');
    el('demo-members').textContent = org.approved
      ? tr('Le membre fictif a été approuvé dans cet espace.', 'The fictional member was approved in this group.')
      : tr('Un membre fictif attend une invitation et une approbation.', 'A fictional member is waiting for an invitation and approval.');
    el('invite-status').textContent = org.invited
      ? tr('Code de démonstration', 'Demo code') + ' · DEMO-' + selected.toUpperCase()
      : tr('Aucune invitation créée dans cet espace.', 'There are no invitations in this group.');
    el('usage').textContent = [
      `${org.members} / ${org.limits.members} ${tr('membres', 'members')}`,
      `${org.groups} / ${org.limits.groups} ${tr('groupes', 'subgroups')}`,
      `${org.events.length} / ${org.limits.events} ${tr('activités', 'events')}`,
      `${org.rides.length} / ${org.limits.rides} ${tr('trajets', 'rides')}`,
      `${org.limits.admins} ${tr('responsable(s) autorisé(s)', 'authorised organiser(s)')}`
    ].join(' · ');
    more('add-ride', actor().offer && org.rides.length < org.limits.rides);
    more('add-event', actor().schedule && org.events.length < org.limits.events);
    more('set-departure', actor().schedule);
    more('add-group', actor().groups && org.groups < org.limits.groups);
    more('invite', actor().members && !org.invited);
    more('approve', actor().members && org.invited && !org.approved && org.members < org.limits.members);
    more('feedback', org.feedback < 5);
    el('feedback-count').textContent = org.feedback
      ? org.feedback + tr(' retour(s) fictif(s)', ' fictional feedback submission(s)')
      : tr('Aucun retour fictif.', 'No fictional feedback yet.');
    renderList('demo-subgroups', org.subgroups, tr('Aucun sous-groupe ajouté pendant cet essai.', 'No subgroups have been added in this trial.'));
    renderList('demo-messages', org.activityMessages.filter(item => item.event === eventId).map(item => item.text),
      tr('Aucun message pour cette activité fictive.', 'No messages for this fictional event.'));
    renderList('demo-notifications', org.notifications, tr('Aucune notification fictive pour cet espace.', 'No fictional notifications for this group.'));
  }

  el('organization').addEventListener('change', event => {
    if (!Object.hasOwn(state, event.target.value)) return;
    selected = event.target.value;
    eventId = '';
    render();
    message(tr('Vous êtes dans l’espace fictif ', 'You are in the fictional group ') + current().name + '.');
  });
  el('persona').addEventListener('change', event => {
    if (!Object.hasOwn(personas, event.target.value)) return;
    role = event.target.value;
    render();
    message(actor().guide);
  });
  el('event-select').addEventListener('change', event => {
    eventId = event.target.value;
    render();
    message(tr('Activité fictive sélectionnée.', 'Fictional event selected.'));
  });
  el('family-seats').addEventListener('change', render);

  el('add-ride').addEventListener('click', () => {
    const org = current();
    const capacity = Number(el('capacity').value);
    if (!actor().offer || org.rides.length >= org.limits.rides || ![1, 2, 3].includes(capacity)) return;
    const direction = el('direction').value === 'return' ? 'return' : 'outbound';
    const point = el('origin').value;
    org.rides.push({
      id: 'local-' + (++serial),
      event: eventId,
      driver: actor().name + tr(' (vous, fictif)', ' (you, fictional)'),
      origin: direction === 'return' ? activeEvent().where : point,
      destination: direction === 'return' ? point : activeEvent().where,
      direction,
      capacity,
      reserved: 0,
      offeredBy: role
    });
    notify(tr('Trajet ajouté', 'Ride added') + ` · ${actor().name} · ${seatCount(capacity)}`);
    render();
    message(tr('Trajet fictif ajouté. Changez de rôle pour tester une réservation.', 'Fictional ride added. Switch roles to test a booking.'));
  });

  el('add-event').addEventListener('click', () => {
    const org = current();
    if (!actor().schedule || org.events.length >= org.limits.events) return;
    eventId = 'event-' + (++serial);
    org.events.push({
      id: eventId,
      title: tr('Rencontre fictive ', 'Fictional meet-up ') + serial,
      when: tr('Prochain samedi · 10:00', 'Next Saturday · 10:00'),
      where: departurePoints.community
    });
    render();
    message(tr('Activité fictive créée. Publiez une consigne de départ ou proposez un trajet.', 'Fictional event created. Publish a departure instruction or offer a ride.'));
  });

  el('set-departure').addEventListener('click', () => {
    const point = el('departure-point').value;
    if (!actor().schedule || !Object.hasOwn(departurePoints, point)) return;
    const event = activeEvent();
    event.departure = tr('Rendez-vous 15 minutes avant l’activité', 'Meet 15 minutes before the event') + ' · ' + departurePoints[point];
    notify(tr('Consigne de départ mise à jour', 'Departure instruction updated') + ' · ' + event.title);
    render();
    message(tr('Consigne visible dans l’activité fictive.', 'The instruction is visible in the fictional event.'));
  });

  el('add-group').addEventListener('click', () => {
    const org = current();
    if (!actor().groups || org.groups >= org.limits.groups) return;
    org.subgroups.push(tr('Équipe fictive ', 'Fictional team ') + (++org.groups));
    render();
    message(tr('Sous-groupe fictif ajouté à cet espace.', 'A fictional subgroup was added to this group.'));
  });

  el('invite').addEventListener('click', () => {
    if (!actor().members || current().invited) return;
    current().invited = true;
    render();
    message(tr('Code d’invitation créé pour cet essai fictif.', 'An invitation code was created for this fictional trial.'));
  });

  el('approve').addEventListener('click', () => {
    const org = current();
    if (!actor().members || !org.invited || org.approved || org.members >= org.limits.members) return;
    org.approved = true;
    org.members += 1;
    render();
    message(tr('Membre fictif approuvé dans ', 'Fictional member approved in ') + org.name + '.');
  });

  el('send-preset').addEventListener('click', () => {
    const key = el('message-preset').value;
    if (!Object.hasOwn(presets, key)) return;
    const org = current();
    org.activityMessages.unshift({ event: eventId, text: actor().name + ' · ' + presets[key] });
    org.activityMessages = org.activityMessages.slice(0, 20);
    render();
    message(tr('Message fictif ajouté au fil de l’activité. Il reste dans cette page.', 'A fictional message was added to the event feed. It stays on this page.'));
  });

  el('feedback').addEventListener('click', () => {
    if (current().feedback >= 5) return;
    current().feedback += 1;
    render();
    message(tr('Retour prédéfini ajouté dans la démo.', 'Preset feedback added in the demo.'));
  });

  el('reset').addEventListener('click', () => {
    state = freshState();
    eventId = '';
    serial = 0;
    el('family-seats').value = '2';
    render();
    message(tr('Les trois scénarios fictifs ont été réinitialisés.', 'All three fictional scenarios were reset.'));
  });

  const requested = new URLSearchParams(location.search);
  const requestedOrg = requested.get('org');
  const requestedRole = requested.get('role');
  if (Object.hasOwn(state, requestedOrg)) selected = requestedOrg;
  if (Object.hasOwn(personas, requestedRole)) role = requestedRole;
  el('organization').value = selected;
  el('persona').value = role;
  render();
})();
