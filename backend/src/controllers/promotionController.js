const promotionService = require('../services/promotionService');
const { validatePayload } = require('../util/helpers');

async function createPromotion(req, res) {
    try {
        const payload = req.body;
        const allowedFields = ['name', 'description', 'type', 'startTime',
            'endTime', 'minSpending', 'rate', 'points'];
        const requiredFields = ['name', 'description',
            'type', 'startTime', 'endTime'];
        validatePayload(payload, allowedFields, requiredFields);

        const promo = await promotionService.createPromotion(payload);

        return res.status(201).json(promo);

    } catch (error) {
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getPromotions(req, res) {
    try {
        // payload in query for get
        const payload = req.query;

        // retreive current user since we need to give different promos dependent on
        // the role of the logged in user
        const currentUser = req.user;
        let allowedFields;
        if (currentUser.role == 'regular' || currentUser.role == 'cashier') {
            allowedFields = ['name', 'type', 'page', 'limit', 'order', 'orderBy'];
        } else {
            // should be manager or superuser
            allowedFields = ['name', 'type', 'page', 'limit', 'started', 'ended', 'order', 'orderBy'];
        }

        validatePayload(payload, allowedFields, []);

        // might have to do a different getPromotions for regulars
        // like getMyPromotions which only looks at the current user's active promos
        // see if this works for the test cases first

        const { count, results } = await promotionService.getPromotions(payload, currentUser);

        // apply filtering to hide description
        const safeResults = results.map(promo => {
            const filteredPromo = {
                id: promo.id,
                name: promo.name,
                type: promo.type,
                startTime: promo.startTime,
                endTime: promo.endTime,
                minSpending: promo.minSpending,
                rate: promo.rate,
                points: promo.points,
            }
            return filteredPromo;
        });

        return res.status(200).json({ count, results: safeResults });

    } catch (error) {
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getPromotionById(req, res) {
    try {
        // payload should be empty
        const payload = req.body;
        validatePayload(payload, [], []);

        // retrieve promoId from parameters
        const { promotionId } = req.params;
        const currentUser = req.user;

        const promo = await promotionService.getPromotionById(promotionId, currentUser);

        if (currentUser.role === 'regular' || currentUser.role === 'cashier') {
            // filter out the start date if logged in user is regular/cashier
            const filteredPromo = {
                id: promo.id,
                name: promo.name,
                description: promo.description,
                type: promo.type,
                endTime: promo.endTime,
                minSpending: promo.minSpending,
                rate: promo.rate,
                points: promo.points
            };
            return res.status(200).json(filteredPromo);
        }

        // otherwise return the promo as is
        return res.status(200).json(promo);

    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updatePromotion(req, res) {
    try {
        const { promotionId } = req.params;
        const payload = req.body;

        const allowedFields = ['name', 'description', 'type', 'startTime',
            'endTime', 'minSpending', 'rate', 'points'];
        validatePayload(payload, allowedFields, []);

        // assume service returns only the fields that were updated
        const updatedPromo = await promotionService.updatePromotion(payload, promotionId);

        return res.status(200).json(updatedPromo);

    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deletePromotion(req, res) {
    try {
        const { promotionId } = req.params;
        // payload should be empty
        const payload = req.body;
        validatePayload(payload, [], []);

        await promotionService.deletePromotion(promotionId);

        return res.status(204).end();

    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'ALREADY_STARTED') {
            return res.status(403).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    createPromotion, getPromotions, getPromotionById, updatePromotion, deletePromotion
}