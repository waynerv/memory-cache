from flask import Blueprint, flash

from memory_cache.decorators import permission_required
from memory_cache.models import User
from memory_cache.utils import redirect_back

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/lock/user/<int:user_id>', methods=['POST'])
@permission_required('MODERATE')
def lock_user(user_id):
    user = User.query.get_or_404(user_id)
    user.lock()
    flash('Account locked.', 'info')
    return redirect_back()


@admin_bp.route('/unlock/user/<int:user_id>', methods=['POST'])
@permission_required('MODERATE')
def unlock_user(user_id):
    user = User.query.get_or_404(user_id)
    user.unlock()
    flash('Account unlocked.', 'info')
    return redirect_back()


@admin_bp.route('/block/user/<int:user_id>', methods=['POST'])
@permission_required('MODERATE')
def block_user(user_id):
    user = User.query.get_or_404(user_id)
    user.block()
    flash('Account blocked.', 'info')
    return redirect_back()


@admin_bp.route('/unblock/user/<int:user_id>', methods=['POST'])
@permission_required('MODERATE')
def unblock_user(user_id):
    user = User.query.get_or_404(user_id)
    user.unblock()
    flash('Account unblocked.', 'info')
    return redirect_back()