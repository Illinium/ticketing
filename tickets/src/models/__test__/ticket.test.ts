import { Ticket } from '../ticket';

it('implements optomostic concurrency control', async () => {
    // create an instance of a ticket
    const ticket = Ticket.build({
        title: 'Concert',
        price: 300,
        userId: 'oihoi124',
    });

    // save the ticket to the database
    await ticket.save();

    // fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);
    // make two separate changes to the tickets we fetched
    firstInstance!.set({ price: 450 });
    secondInstance!.set({ price: 800 });

    // save the first fetched ticket
    await firstInstance!.save();

    // save the second  fetched ticket and expect an error
    try {
        await secondInstance!.save();
    } catch (error) {
        return;
    }
    throw new Error('Should not reach this point!');
});

it('increments the version number on multiple saves', async () => {
    // create an instance of a ticket
    const ticket = Ticket.build({
        title: 'Concert',
        price: 300,
        userId: 'oihoi124',
    });

    await ticket.save();

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);
});
