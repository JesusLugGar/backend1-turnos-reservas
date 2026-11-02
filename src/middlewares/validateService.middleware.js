
const REQUIRED_FIELDS = ['name', 'description', 'duration', 'price', 'category', 'available'];

export function validateService(req, res, next) {
    const missingFields = REQUIRED_FIELDS.filter(
        (field) => req.body?.[field] === undefined || req.body[field] === null || req.body[field] === '',
    );

    if (missingFields.length > 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Faltan campos obligatorios',
            missingFields
        });
    }

    next();
}
