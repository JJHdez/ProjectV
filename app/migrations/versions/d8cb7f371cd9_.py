"""empty message

Revision ID: d8cb7f371cd9
Revises: 
Create Date: 2017-05-26 16:15:59.150222

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd8cb7f371cd9'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('create_date', sa.DateTime(), nullable=False),
    sa.Column('facebook', sa.VARCHAR(), nullable=True),
    sa.Column('google_plus', sa.VARCHAR(), nullable=True),
    sa.Column('email', sa.VARCHAR(), nullable=False),
    sa.Column('name', sa.VARCHAR(), nullable=False),
    sa.Column('last_name', sa.VARCHAR(), nullable=True),
    sa.Column('cover', sa.Text(), nullable=True),
    sa.Column('timezone', sa.VARCHAR(), nullable=True),
    sa.Column('password', sa.VARCHAR(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('users')
    # ### end Alembic commands ###