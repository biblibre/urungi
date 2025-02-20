export default {
    newID,
};

export function newID (layer) {
    // FIXME idCounter is not persistent
    const counter = ((layer.idCounter || 0) + 1) % (26 ** 2);
    layer.idCounter = counter;
    let uid = 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(counter / 26)) +
        'abcdefghijklmnopqrstuvwxyz'.charAt(counter % 26);
    const rand = Math.floor(Math.random() * 676);
    uid += 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(rand / 26)) +
    'abcdefghijklmnopqrstuvwxyz'.charAt(rand % 26);
    // I couldn't decide between using a counter to guarantee unique ids in theory,
    // or using random characters to be certain the ids are very different from each other in practice
    // so I ended up doing both.

    return uid;
}
